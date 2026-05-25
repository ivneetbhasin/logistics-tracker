import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctcmmonsbiurvxbbvvzs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y21tb25zYml1cnZ4YmJ2dnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzgzNjIsImV4cCI6MjA5NTAxNDM2Mn0.P_lDEV5BOq6PbjFAkU0-npyxB87rakkmOD3zn5QSWEk'
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;