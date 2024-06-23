DROP TABLE IF EXISTS ct.criminal_dates_staging;
DROP TABLE IF EXISTS ct.file_imports;
DROP TABLE IF EXISTS ct.criminal_dates;
DROP TYPE IF EXISTS ct.calendar_sessions;
DROP TYPE IF EXISTS ct.case_types;
DROP SCHEMA IF EXISTS ct;
DROP ROLE IF EXISTS ct_user;

CREATE ROLE ct_user WITH 
	NOSUPERUSER
	NOCREATEDB
	NOCREATEROLE
	INHERIT
	LOGIN
	NOREPLICATION
	NOBYPASSRLS
	CONNECTION LIMIT -1;

CREATE SCHEMA ct;

CREATE TYPE ct.case_types AS ENUM (
'CR', 
'IF');

CREATE TYPE ct.calendar_sessions AS ENUM (
'AM', 
'PM',
'NC');

-- Guessing a bit at which might turn out to have nulls
CREATE TABLE ct.criminal_dates (
	case_number text PRIMARY KEY,
	case_type ct.case_types NOT NULL,
	citation_number text NULL,
	calendar_date date NOT NULL,
	calendar_session ct.calendar_sessions NOT NULL,
	courtroom text NULL,
	defendant_name text NOT NULL,
	defendant_race text NULL,
	defendant_sex text NULL,
	offense_code text NULL,
	offense_description text NULL,
	officer_witness_type text NULL,
	officer_agency text NULL,
	officer_number text NULL,
	officer_name text NULL,
	officer_city text NULL,
	court_type text NULL,
	ethnicity text NULL
);

CREATE TABLE ct.criminal_dates_staging (LIKE ct.criminal_dates);
	ALTER TABLE ct.criminal_dates_staging ADD PRIMARY KEY (case_number);

CREATE TABLE ct.file_imports (
	import_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
	filename text NULL,
	comment text NULL
);

-- Permissions
ALTER TABLE ct.criminal_dates OWNER TO ct_user;
ALTER TABLE ct.criminal_dates_staging OWNER TO ct_user;
ALTER TABLE ct.file_imports OWNER TO ct_user;
GRANT ALL ON TABLE ct.criminal_dates TO ct_user;
GRANT ALL ON TABLE ct.criminal_dates_staging TO ct_user;
GRANT ALL ON TABLE ct.file_imports TO ct_user;
