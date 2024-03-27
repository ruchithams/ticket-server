const express = require("express");
const app = express();
// Enable CORS for all routes
const cors = require('cors');
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
const { TicketStatus } = require('./enum');
// Import dbUtils module
const { ensureTicketsTableExists, insertTicketData, getAllTickets, updateTicketData, getTicketData } = require('./dbUtils');

// Call the function to ensure the 'tickets' table exists
ensureTicketsTableExists();

// Route to handle POST requests to save ticket data
app.post('/api/ticket', async (req, res) => {
    try {
        console.log('entering api ticket');
        const { username, email, description} = req.body;

        // Insert ticket data into Superbase database
        await insertTicketData(username, email, description);

        res.status(201).json({ message: 'Ticket data saved successfully'});
    } catch (error) {
        console.error('Error creating ticket:', error.message);
        res.status(500).json({ error: 'Error saving ticket data' });
    }
});

// Route to handle GET requests to fetch all tickets
app.get('/api/tickets', async (req, res) => {
  try {
      // Fetch all tickets using the utility function
      const tickets = await getAllTickets();

      // Respond with the fetched tickets
      res.json(tickets);
  } catch (error) {
      console.error('Error fetching tickets:', error.message);
      res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Route to handle PUT requests to update ticket data
app.put('/api/update-ticket', async (req, res) => {
  try {
      const { id, status, response } = req.body;

      // Fetch the existing ticket data
      const existingTicket = await getTicketData(id);

      if (!existingTicket) {
          return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if the ticket is already resolved
      if (existingTicket.status === TicketStatus.RESOLVED.toString()) {
          return res.status(400).json({ error: 'Ticket is already resolved, please open a new ticket' });
      }

      // Check if the ticket status is being set to resolved
      if (status === TicketStatus.RESOLVED.toString() && !response) {
          return res.status(400).json({ error: 'Ticket response is required for resolved status' });
      }

      await updateTicketData(id, response, status);

      // If the ticket is resolved and a response is provided, send an email
      if (status === TicketStatus.RESOLVED.toString()) {
          console.log(`Email with response (${response}) is sent to the user (${existingTicket.email}) who created the ticket.`);
          // Logic to send email (replace with actual implementation)
      }

      res.json({ message: 'Ticket status updated successfully'});
  } catch (error) {
      console.error('Error updating ticket status:', error.message);
      res.status(500).json({ error: 'Failed to update ticket, please try again.' });
  }
});


const server = app.listen(port, () => console.log(`Ticket Server listening on port ${port}!`));
