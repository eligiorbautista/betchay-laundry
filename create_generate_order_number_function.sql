-- Create function to generate unique order numbers
-- Format: ORDYYMMDDXXX (e.g., ORD250125001)
-- This function generates order numbers in the format: ORD + 2-digit year + 2-digit month + 2-digit day + 3-digit random number

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    order_num TEXT;
    year_part TEXT;
    month_part TEXT;
    day_part TEXT;
    random_part TEXT;
    exists_check INTEGER;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    -- Generate order number components
    year_part := TO_CHAR(CURRENT_DATE, 'YY');
    month_part := TO_CHAR(CURRENT_DATE, 'MM');
    day_part := TO_CHAR(CURRENT_DATE, 'DD');
    
    -- Try to generate a unique order number
    LOOP
        -- Generate random 3-digit number (000-999)
        random_part := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        -- Construct order number
        order_num := 'ORD' || year_part || month_part || day_part || random_part;
        
        -- Check if order number already exists
        SELECT COUNT(*) INTO exists_check
        FROM orders
        WHERE order_number = order_num;
        
        -- If unique, return it
        IF exists_check = 0 THEN
            RETURN order_num;
        END IF;
        
        -- Increment attempt counter
        attempt := attempt + 1;
        
        -- If we've tried too many times, append a timestamp-based suffix
        IF attempt >= max_attempts THEN
            -- Use microseconds to ensure uniqueness
            random_part := LPAD((EXTRACT(MICROSECONDS FROM NOW())::INTEGER % 1000)::TEXT, 3, '0');
            order_num := 'ORD' || year_part || month_part || day_part || random_part;
            
            -- Final check
            SELECT COUNT(*) INTO exists_check
            FROM orders
            WHERE order_number = order_num;
            
            IF exists_check = 0 THEN
                RETURN order_num;
            ELSE
                -- Last resort: add timestamp
                order_num := 'ORD' || year_part || month_part || day_part || 
                            LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
                RETURN order_num;
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO anon;

-- Add comment to function
COMMENT ON FUNCTION public.generate_order_number() IS 'Generates a unique order number in the format ORDYYMMDDXXX where YY is 2-digit year, MM is month, DD is day, and XXX is a 3-digit random number';

