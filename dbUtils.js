const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const {randomUUID} = require("crypto");
const { TicketStatus } = require('./enum');
//const { v4: uuidv4 } = require('uuid');
//import { createClient } from '@supabase/supabase-js'

// Initialize Superbase client
const supabaseUrl = 'https://bvggckvgzswzaiizfwap.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to ensure the 'tickets' table exists
async function ensureTicketsTableExists() {
    try {
        const { error } = await supabase
            .from('tickets')
            .select('*')
            .limit(1); // Attempt to select a record from the 'tickets' table
            
        if (error && error.code === '42P01') {
            // If the table doesn't exist, create it
            await supabase.from('tickets').create({
                id: { type: 'uuid', primary: true, default: 'randomUUID()' },
                username: { type: 'text' },
                email: { type: 'text' },
                ticketDescription: { type: 'text' },
                ticketResponse: { type: 'text' },
                ticketStatus: { type: 'text', default: 'new' },
                createdAt: { type: 'timestamp with time zone', default: 'now()' },
                updatedAt: { type: 'timestamp with time zone', default: 'now()' }
            });
            console.log('Tickets table created successfully');
        }
    } catch (error) {
        console.error('Error ensuring tickets table exists:', error.message);
        throw error;
    }
}

// Function to insert ticket data into Superbase database
async function insertTicketData(username, email, ticketDescription, id = null, createdAt = null, ticketStatus = TicketStatus.NEW.toString()) {
    try {
        //ID is null when ticket is created for the first time.
        if(id == null)
        {
            id = randomUUID(); // Generate UUID for the ticket
            //id = uuidv4(); // Generate UUID for the ticket
        }

        const updatedAt = new Date().toISOString(); // Current timestamp of updation
        if(ticketStatus == TicketStatus.NEW.toString() && createdAt == null) {
            createdAt = updatedAt
        } 
        const { data, error } = await supabase
            .from('tickets')
            .insert([{ id, username, email, ticketDescription, ticketResponse, ticketStatus, createdAt, updatedAt }]);

        if (error) {
            throw error;
        }

        return { data };
    } catch (error) {
        throw error;
    }
}

// Function to fetch the most recent ticket data from the database
async function getRecentTicketData() {
    try {
        const { data: recentTicket, error } = await supabase
            .from('tickets')
            .select('*')
            .order('updatedAt', { ascending: false })
            .single();

        if (error) {
            throw error;
        }

        return recentTicket;
    } catch (error) {
        throw error;
    }
}

module.exports = {ensureTicketsTableExists, insertTicketData, getRecentTicketData};