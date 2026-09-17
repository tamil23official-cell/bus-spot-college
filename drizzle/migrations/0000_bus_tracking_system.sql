-- Roles
create type public.app_role as enum ('admin','student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Student',
  student_id text,
  email text,
  department text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'student',
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

-- new user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, student_id, email, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','Student'),
    new.raw_user_meta_data->>'student_id',
    new.email,
    new.raw_user_meta_data->>'department'
  ) on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when coalesce(new.raw_user_meta_data->>'role','student') = 'admin' then 'admin'::app_role else 'student'::app_role end
  ) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Domain tables
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  license_no text,
  experience_years int not null default 1,
  created_at timestamptz not null default now()
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_point text not null,
  destination text not null,
  distance_km numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.buses (
  id uuid primary key default gen_random_uuid(),
  bus_number text not null unique,
  route_id uuid references public.routes(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  capacity int not null default 50,
  occupancy int not null default 0,
  status text not null default 'Not Started',
  eta text,
  current_lat numeric,
  current_lng numeric,
  created_at timestamptz not null default now()
);

create table public.bus_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  name text not null,
  stop_order int not null default 1,
  arrival_time text,
  lat numeric not null,
  lng numeric not null
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid not null references public.buses(id) on delete cascade,
  shift text not null default 'Morning',
  departure_time text not null,
  arrival_time text not null,
  days text not null default 'Mon - Sat'
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text not null default 'General',
  created_at timestamptz not null default now()
);

grant select on public.drivers, public.routes, public.buses, public.bus_stops, public.schedules, public.announcements to anon;
grant select, insert, update, delete on public.drivers, public.routes, public.buses, public.bus_stops, public.schedules, public.announcements to authenticated;
grant all on public.drivers, public.routes, public.buses, public.bus_stops, public.schedules, public.announcements to service_role;

alter table public.drivers enable row level security;
alter table public.routes enable row level security;
alter table public.buses enable row level security;
alter table public.bus_stops enable row level security;
alter table public.schedules enable row level security;
alter table public.announcements enable row level security;

create policy "public read drivers" on public.drivers for select using (true);
create policy "public read routes" on public.routes for select using (true);
create policy "public read buses" on public.buses for select using (true);
create policy "public read stops" on public.bus_stops for select using (true);
create policy "public read schedules" on public.schedules for select using (true);
create policy "public read announcements" on public.announcements for select using (true);

create policy "admin write drivers" on public.drivers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write routes" on public.routes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write buses" on public.buses for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write stops" on public.bus_stops for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write schedules" on public.schedules for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write announcements" on public.announcements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Sample data
insert into public.drivers (id, name, phone, license_no, experience_years) values
 ('11111111-1111-1111-1111-111111111101','Ramesh Kumar','+91 98765 43210','TN45AB1234',12),
 ('11111111-1111-1111-1111-111111111102','Suresh Babu','+91 98765 43211','TN45AB1235',8),
 ('11111111-1111-1111-1111-111111111103','Anand Raj','+91 98765 43212','TN45AB1236',6),
 ('11111111-1111-1111-1111-111111111104','Vijay Prakash','+91 98765 43213','TN45AB1237',10),
 ('11111111-1111-1111-1111-111111111105','Karthik Selvam','+91 98765 43214','TN45AB1238',4);

insert into public.routes (id, name, start_point, destination, distance_km) values
 ('22222222-2222-2222-2222-222222222201','Route 1 - Gandhipuram Line','Gandhipuram','College Campus',18.5),
 ('22222222-2222-2222-2222-222222222202','Route 2 - Ukkadam Line','Ukkadam','College Campus',22.0),
 ('22222222-2222-2222-2222-222222222203','Route 3 - Saravanampatti Line','Saravanampatti','College Campus',12.4),
 ('22222222-2222-2222-2222-222222222204','Route 4 - Peelamedu Line','Peelamedu','College Campus',9.8),
 ('22222222-2222-2222-2222-222222222205','Route 5 - Singanallur Line','Singanallur','College Campus',15.2);

insert into public.buses (id, bus_number, route_id, driver_id, capacity, occupancy, status, eta, current_lat, current_lng) values
 ('33333333-3333-3333-3333-333333333301','TN 45 A 1001','22222222-2222-2222-2222-222222222201','11111111-1111-1111-1111-111111111101',52,44,'On Time','08:35 AM',11.0168,76.9558),
 ('33333333-3333-3333-3333-333333333302','TN 45 A 1002','22222222-2222-2222-2222-222222222202','11111111-1111-1111-1111-111111111102',52,50,'Delayed','08:55 AM',10.9925,76.9614),
 ('33333333-3333-3333-3333-333333333303','TN 45 A 1003','22222222-2222-2222-2222-222222222203','11111111-1111-1111-1111-111111111103',48,20,'Not Started','08:20 AM',11.0780,77.0060),
 ('33333333-3333-3333-3333-333333333304','TN 45 A 1004','22222222-2222-2222-2222-222222222204','11111111-1111-1111-1111-111111111104',56,56,'Completed','08:10 AM',11.0270,77.0270),
 ('33333333-3333-3333-3333-333333333305','TN 45 A 1005','22222222-2222-2222-2222-222222222205','11111111-1111-1111-1111-111111111105',50,31,'On Time','08:45 AM',11.0060,77.0290);

insert into public.bus_stops (route_id, name, stop_order, arrival_time, lat, lng) values
 ('22222222-2222-2222-2222-222222222201','Gandhipuram Bus Stand',1,'07:15 AM',11.0168,76.9558),
 ('22222222-2222-2222-2222-222222222201','R.S. Puram',2,'07:28 AM',11.0069,76.9498),
 ('22222222-2222-2222-2222-222222222201','Sai Baba Colony',3,'07:40 AM',11.0290,76.9500),
 ('22222222-2222-2222-2222-222222222201','Peelamedu Junction',4,'08:05 AM',11.0270,77.0270),
 ('22222222-2222-2222-2222-222222222201','College Campus',5,'08:35 AM',11.0512,77.0180),
 ('22222222-2222-2222-2222-222222222202','Ukkadam',1,'07:00 AM',10.9925,76.9614),
 ('22222222-2222-2222-2222-222222222202','Town Hall',2,'07:15 AM',10.9990,76.9620),
 ('22222222-2222-2222-2222-222222222202','Singanallur',3,'07:45 AM',11.0060,77.0290),
 ('22222222-2222-2222-2222-222222222202','College Campus',4,'08:55 AM',11.0512,77.0180),
 ('22222222-2222-2222-2222-222222222203','Saravanampatti',1,'07:30 AM',11.0780,77.0060),
 ('22222222-2222-2222-2222-222222222203','Kalapatti Road',2,'07:45 AM',11.0640,77.0290),
 ('22222222-2222-2222-2222-222222222203','College Campus',3,'08:20 AM',11.0512,77.0180),
 ('22222222-2222-2222-2222-222222222204','Peelamedu',1,'07:35 AM',11.0270,77.0270),
 ('22222222-2222-2222-2222-222222222204','Hope College',2,'07:45 AM',11.0300,77.0350),
 ('22222222-2222-2222-2222-222222222204','College Campus',3,'08:10 AM',11.0512,77.0180),
 ('22222222-2222-2222-2222-222222222205','Singanallur Lake',1,'07:20 AM',11.0060,77.0290),
 ('22222222-2222-2222-2222-222222222205','Ondipudur',2,'07:35 AM',10.9990,77.0450),
 ('22222222-2222-2222-2222-222222222205','Nehru Nagar',3,'07:55 AM',11.0330,77.0330),
 ('22222222-2222-2222-2222-222222222205','College Campus',4,'08:45 AM',11.0512,77.0180);

insert into public.schedules (bus_id, shift, departure_time, arrival_time, days) values
 ('33333333-3333-3333-3333-333333333301','Morning','07:15 AM','08:35 AM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333301','Evening','04:30 PM','05:50 PM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333302','Morning','07:00 AM','08:55 AM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333302','Evening','04:30 PM','06:20 PM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333303','Morning','07:30 AM','08:20 AM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333303','Evening','04:45 PM','05:35 PM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333304','Morning','07:35 AM','08:10 AM','Mon - Fri'),
 ('33333333-3333-3333-3333-333333333304','Evening','04:30 PM','05:10 PM','Mon - Fri'),
 ('33333333-3333-3333-3333-333333333305','Morning','07:20 AM','08:45 AM','Mon - Sat'),
 ('33333333-3333-3333-3333-333333333305','Evening','04:40 PM','06:05 PM','Mon - Sat');

insert into public.announcements (title, message, category) values
 ('Bus TN 45 A 1002 running late','Due to heavy traffic near Ukkadam, Route 2 bus is delayed by about 20 minutes today.','Delay'),
 ('Route 3 stop change','Kalapatti Road stop is temporarily moved 200m ahead near the new signal because of road work.','Route Change'),
 ('Holiday notice','All college buses will not operate this Saturday due to the semester holiday.','Holiday'),
 ('Evening bus timing update','Evening buses will depart 15 minutes earlier during the exam week.','General'),
 ('New bus added on Peelamedu line','An additional bus has been assigned to Route 4 to reduce crowding in the morning shift.','General');