--\connect postgres;
--drop database if exists cardimom;
create database cardimom;
\connect cardimom;
drop table if exists posts;
create table if not exists posts (
    link text primary key,
    author text not null,
    posted_at timestamp with time zone,
    published_at timestamp with time zone
);

insert into posts values('https://otee.dev/2021/08/18/cache-replacement-policy.html', 'otee', CURRENT_TIMESTAMP, '2021-09-04T06:29:07.404Z');
insert into posts values('https://otee.dev/2021/08/05/memoization.html', 'otee', CURRENT_TIMESTAMP, TO_TIMESTAMP(1630737250));


let post  = 
{
  title: 'Cache Replacement',
  date: 1629244800000,
  link: 'https://otee.dev/2021/08/18/cache-replacement-policy',
  author: 'otee'
}

await clientNew.query("insert into posts values($1, $2, CURRENT_TIMESTAMP, TO_TIMESTAMP($3))", [post.title, post.author, post.date/1000]);