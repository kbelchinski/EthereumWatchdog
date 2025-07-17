CREATE OR REPLACE FUNCTION notify_rules_updated()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('rules_updated', '');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rules_updated ON config_rules;

CREATE TRIGGER trigger_rules_updated
AFTER INSERT OR UPDATE OR DELETE ON config_rules
FOR EACH STATEMENT
EXECUTE FUNCTION notify_rules_updated();