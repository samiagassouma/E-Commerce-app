create or replace function public.get_repartition_by_plan()
returns table (
  subscriptionPlan text,
  total_payments bigint,
  total_revenue numeric
)
language sql
as $$
  select "subscriptionPlan",
         count(*) as total_payments,
         sum(amount) as total_revenue
  from payment
where "paymentStatus" = 'completed'
group by "subscriptionPlan";
$$;



create or replace function revenue_by_month()
returns table(month date, total_revenue numeric)
language sql
as $$
  select 
    date_trunc('month', "createdAt") as month,
    sum(amount) as total_revenue
  from payment
  where "paymentStatus" = 'completed'
  group by month
  order by month;
$$;


create or replace function assistants_per_day()
returns table(day date, total int)
language sql
as $$
  select date(created_at) as day, count(*) as total
  from assistant
  group by day
  order by day;
$$;


create or replace function assistants_per_month()
returns table(month text, total int)
language sql
as $$
  select to_char(created_at, 'YYYY-MM') as month, count(*) as total
  from assistant
  group by 1
  order by month;
$$;


create or replace function assistants_per_year()
returns table(year int, total int)
language sql
as $$
  select extract(year from created_at)::int as year, count(*) as total
  from assistant
  group by 1
  order by year;
$$;

create or replace function assistant_statistics(granularity text)
returns table(label text, total int)
language plpgsql
as $$
begin
  if granularity = 'per_day' then
    return query
    select to_char(createdAt, 'YYYY-MM-DD') as label, count(*)::int as total
    from assistants
    group by 1
    order by label;

  elsif granularity = 'per_month' then
    return query
    select to_char(createdAt, 'YYYY-MM') as label, count(*)::int as total
    from assistants
    group by 1
    order by label;

  elsif granularity = 'per_year' then
    return query
    select extract(year from createdAt)::text as label, count(*)::int as total
    from assistants
    group by 1
    order by label;

  else
    raise exception 'Invalid granularity. Must be per_day, per_month, or per_year';
  end if;
end;
$$;


create or replace function assistants_status_counts()
returns json
language sql
as $$
  with last_payments as (
    select distinct on (a.id)
      a.id,
      p."billingCycleEnd",
      p."paymentStatus",
      p."paymentDate"
    from assistants a
    join payment p on p."assistantId" = a.id
    order by a.id, p."paymentDate" desc
  )
  select json_build_object(    
    'activeCount', count(*) filter (where "paymentStatus" = 'completed' and "billingCycleEnd" > now()),
    'inactiveCount', count(*) filter (where not ("paymentStatus" = 'completed' and "billingCycleEnd" > now()))
 )
 from last_payments;
$$;



 async getAssistantsDistribution() {
    // Count assistants per user
    const supabase = this.supabaseService.getClient();
    const { data: assistants, error } = await supabase
      .from('assistants')
      .select('idUser');

    if (error) {
      throw new Error(error.message);
    }

    const distribution = { '1': 0, '2': 0, '3': 0, '4+': 0 };

    if (assistants) {
      const userCounts: Record<string, number> = {};

      assistants.forEach((a) => {
        userCounts[a.idUser] = (userCounts[a.idUser] || 0) + 1;
      });

      Object.values(userCounts).forEach((count) => {
        if (count >= 4) distribution['4+']++;
        else distribution[count]++;
      });
    }

    return distribution;
  }