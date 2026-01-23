-- Healthcare DB Functions

-- RPC: Dispense Prescription
-- Deducts stock from the Primary Warehouse and updates prescription status.
create or replace function dispense_prescription(p_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_prescription record;
  v_item record;
  v_warehouse_id uuid;
  v_current_stock numeric;
  v_item_name text;
begin
  -- Get prescription info
  select * into v_prescription from prescriptions where id = p_id;
  
  if not found then
    raise exception 'Prescription not found';
  end if;

  if v_prescription.status = 'dispensed' then
    raise exception 'Prescription already dispensed';
  end if;

  -- Get primary warehouse for the same org
  select id into v_warehouse_id from warehouses 
  where org_id = v_prescription.org_id and is_primary = true limit 1;

  if v_warehouse_id is null then
    -- Fallback: Try to find ANY warehouse if no primary set
    select id into v_warehouse_id from warehouses 
    where org_id = v_prescription.org_id limit 1;
  end if;

  if v_warehouse_id is null then
    raise exception 'No warehouse found to deduct stock from. Please create a warehouse first.';
  end if;

  -- Loop through items to check and deduct
  for v_item in select * from prescription_items where prescription_id = p_id loop
      -- Get stock level and item name (for error msg)
      select s.quantity_on_hand, i.name into v_current_stock, v_item_name
      from inventory_items i
      left join inventory_stock s on s.item_id = i.id and s.warehouse_id = v_warehouse_id
      where i.id = v_item.item_id;

      if v_current_stock is null then
        v_current_stock := 0;
      end if;

      if v_current_stock < v_item.quantity then
         raise exception 'Insufficient stock for item "%" (Required: %, Available: %)', v_item_name, v_item.quantity, v_current_stock;
      end if;

      -- Deduct stock
      update inventory_stock
      set quantity_on_hand = quantity_on_hand - v_item.quantity,
          updated_at = now()
      where item_id = v_item.item_id and warehouse_id = v_warehouse_id;
      
      -- Update item dispensed time
      update prescription_items
      set dispensed_at = now()
      where id = v_item.id;
  end loop;

  -- Update prescription status
  update prescriptions
  set status = 'dispensed',
      updated_at = now()
  where id = p_id;

  return json_build_object('success', true, 'warehouse_id', v_warehouse_id);
end;
$$;

-- Grant execute
grant execute on function dispense_prescription(uuid) to authenticated, service_role;
