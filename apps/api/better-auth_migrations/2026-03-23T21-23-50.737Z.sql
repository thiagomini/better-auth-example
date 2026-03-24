create table "passwordHistory" ("id" text not null primary key, "userId" text not null references "user" ("id") on delete cascade, "passwordHash" text not null, "createdAt" timestamptz not null);

create index "passwordHistory_userId_idx" on "passwordHistory" ("userId");