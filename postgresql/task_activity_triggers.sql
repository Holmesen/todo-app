-- Task Activity Logging Triggers
-- This file contains triggers to automatically log task-related activities

-- Function to log task creation
CREATE OR REPLACE FUNCTION log_task_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO todo_activity_logs (user_id, task_id, action_type, action_details)
    VALUES (
        NEW.user_id,
        NEW.id,
        'create',
        jsonb_build_object(
            'title', NEW.title,
            'priority', NEW.priority,
            'due_date', NEW.due_date,
            'category_id', NEW.category_id
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task creation
CREATE TRIGGER task_creation_logger
AFTER INSERT ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_creation();

-- Function to log task updates
CREATE OR REPLACE FUNCTION log_task_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip if it's just a status change to 'completed' or from 'completed'
    -- Those will be handled by the specific completion/reopening triggers
    IF (OLD.status != 'completed' AND NEW.status = 'completed') OR 
       (OLD.status = 'completed' AND NEW.status != 'completed') THEN
        RETURN NEW;
    END IF;
    
    -- Only log if there are actual changes to relevant fields
    IF OLD.title != NEW.title OR
       OLD.description IS DISTINCT FROM NEW.description OR
       OLD.due_date IS DISTINCT FROM NEW.due_date OR
       OLD.due_time IS DISTINCT FROM NEW.due_time OR
       OLD.priority != NEW.priority OR
       OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        
        INSERT INTO todo_activity_logs (user_id, task_id, action_type, action_details)
        VALUES (
            NEW.user_id,
            NEW.id,
            'update',
            jsonb_build_object(
                'previous', jsonb_build_object(
                    'title', OLD.title,
                    'description', OLD.description,
                    'due_date', OLD.due_date,
                    'due_time', OLD.due_time,
                    'priority', OLD.priority,
                    'category_id', OLD.category_id
                ),
                'current', jsonb_build_object(
                    'title', NEW.title,
                    'description', NEW.description,
                    'due_date', NEW.due_date,
                    'due_time', NEW.due_time,
                    'priority', NEW.priority,
                    'category_id', NEW.category_id
                )
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task updates
CREATE TRIGGER task_update_logger
AFTER UPDATE ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_update();

-- Function to log task deletion
CREATE OR REPLACE FUNCTION log_task_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO todo_activity_logs (user_id, task_id, action_type, action_details)
    VALUES (
        OLD.user_id,
        OLD.id,
        'delete',
        jsonb_build_object(
            'title', OLD.title,
            'priority', OLD.priority,
            'due_date', OLD.due_date,
            'status', OLD.status
        )
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task deletion
CREATE TRIGGER task_deletion_logger
BEFORE DELETE ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_deletion();

-- Function to log task completion
CREATE OR REPLACE FUNCTION log_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        INSERT INTO todo_activity_logs (user_id, task_id, action_type, action_details)
        VALUES (
            NEW.user_id,
            NEW.id,
            'complete',
            jsonb_build_object(
                'title', NEW.title,
                'completed_at', NEW.completed_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task completion
CREATE TRIGGER task_completion_logger
AFTER UPDATE OF status ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_completion();

-- Function to log task reopening
CREATE OR REPLACE FUNCTION log_task_reopening()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        INSERT INTO todo_activity_logs (user_id, task_id, action_type, action_details)
        VALUES (
            NEW.user_id,
            NEW.id,
            'reopen',
            jsonb_build_object(
                'title', NEW.title,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task reopening
CREATE TRIGGER task_reopening_logger
AFTER UPDATE OF status ON todo_tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_reopening(); 