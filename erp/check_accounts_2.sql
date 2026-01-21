select code, name from accounts where org_id in (select org_id from profiles limit 1);
