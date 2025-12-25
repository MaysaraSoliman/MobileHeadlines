-- Safe migration to ensure all AppointmentStatus enum values exist
DO $$
BEGIN
    -- 1. Add 'OPEN' if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OPEN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'OPEN';
    END IF;

    -- 2. Add 'NOSHOW' if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'NOSHOW' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'NOSHOW';
    END IF;

    -- 3. Add 'CHECKEDIN' if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CHECKEDIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'CHECKEDIN';
    END IF;

    -- 4. Add 'INPROGRESS' if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INPROGRESS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'INPROGRESS';
    END IF;

    -- 5. Add 'DELAYED' if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DELAYED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'DELAYED';
    END IF;

    -- 6. Add 'COMPLETED' if not exists (Checking just in case)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMPLETED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'COMPLETED';
    END IF;

    -- 7. Add 'CANCELED' if not exists (Handling the specific case mentioned)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CANCELED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'CANCELED';
    END IF;
END $$;
