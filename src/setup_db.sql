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

