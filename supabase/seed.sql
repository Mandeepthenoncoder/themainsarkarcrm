-- Sarkar Jewellers Organization Seed Data
-- This file creates the basic organization structure

-- Insert showrooms
INSERT INTO public.showrooms (id, name, location_address, city, state, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Satellite Store', 'Satellite Area', 'Ahmedabad', 'Gujarat', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Science City Store', 'Science City Area', 'Ahmedabad', 'Gujarat', 'active');

-- Insert system settings
INSERT INTO public.system_settings (key, value, description, data_type, is_public) VALUES
  ('company_name', '"Sarkar Jewellers"', 'Company name', 'string', true),
  ('company_established', '"1985"', 'Year company was established', 'string', true),
  ('head_office', '"Ahmedabad, Gujarat"', 'Head office location', 'string', true),
  ('total_showrooms', '2', 'Total number of showrooms', 'number', true),
  ('satellite_store_id', '"11111111-1111-1111-1111-111111111111"', 'Satellite Store ID', 'string', false),
  ('science_city_store_id', '"22222222-2222-2222-2222-222222222222"', 'Science City Store ID', 'string', false); 