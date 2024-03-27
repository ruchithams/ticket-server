const { createClient } = require('@supabase/supabase-js');
const { TicketStatus } = require('./enum');

// Initialize Superbase client
const supabaseUrl = 'https://bvggckvgzswzaiizfwap.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

//Function to ensure the 'tickets' table exists
async function ensureTicketsTableExists() {
    try {
        const { error } = await supabase
            .from('tickets')
            .select('*')
            .limit(1); // Attempt to select a record from the 'tickets' table
        // TODO: Not sure why create table is not supported by supbase library. Created table by running the query using CLI tool on the supbase client.    
        if (false && error && error.code === '42P01') {
            const { error } = await supabase
            .from('tickets') // Replace 'tickets' with the desired table name
            .sql(`
                CREATE TABLE tickets (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    username TEXT,
                    email TEXT,
                    description TEXT,
                    response TEXT,
                    ticketStatus TEXT DEFAULT 'new',
                    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);

            if (error) {
                throw error;
            }

            console.log('Ticket table created successfully');
        }
    } catch (error) {
        console.error('Error creating ticket table:', error.message);
    }
}

// Function to insert ticket data into Superbase database
async function insertTicketData(username, email, description) {
    try {
        const { error } = await supabase
            .from('tickets')
            .insert([{ 
                username: username, 
                email: email, 
                description: description, 
                response: null, 
                status: TicketStatus.NEW.toString()}]);
        
        if(error) {
            throw error;
        }
        return;
    } catch (error) {
        console.error('Error creating ticket:', error.message);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
}

// Function to insert ticket data into Superbase database
async function updateTicketData(id, status, response) {
    try {
        const {error} = await supabase
            .from('tickets')
            .update({
                status: status,
                response: response,
                updatedat:((new Date()).toISOString()).toLocaleString('zh-TW')
            })
            .eq('id', id);

        if(error){
            throw error;
        }
        return;
    } catch (error) {
        console.error('Error updating ticket:', error.message);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
}


async function getTicketData(id) {
    try {
        const { data, error } = await supabase
        .from('tickets')
        .select()
        .eq('id', id)
        .single();

        return data;
    } catch (error) {
        console.error('Error fetching ticket:', error.message);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
}

async function getAllTickets() {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('username', 'email', 'description', 'response', 'createdat', 'updatedat','status');

        return data;
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
}

module.exports = {ensureTicketsTableExists, insertTicketData, updateTicketData, getAllTickets, getTicketData};
