const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const { TicketStatus } = require('./enums');
// Import dbUtils module
const { ensureTicketsTableExists, insertTicketData, getRecentTicketData } = require('./dbUtils');

// Call the function to ensure the 'tickets' table exists
ensureTicketsTableExists();

app.get("/", (req, res) => res.type('html').send(html));

// Route to handle POST requests to save ticket data
app.post('/api/ticket', async (req, res) => {
    try {
        const { username, email, ticketDescription, ticketStatus } = req.body.ticketRequest;

        // Insert ticket data into Superbase database
        const { data } = await insertTicketData(username, email, ticketDescription, ticketStatus);

        res.status(201).json({ message: 'Ticket data saved successfully', data });
    } catch (error) {
        console.error('Error saving ticket data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to handle PUT requests to update ticket data
app.put('/api/ticket/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { ticketStatus, ticketResponse } = req.body;

      // Fetch the existing ticket data
      const existingTicket = await getTicketData(id);

      if (!existingTicket) {
          return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if the ticket is already resolved
      if (existingTicket.ticketStatus === TicketStatus.RESOLVED.toString()) {
          return res.status(400).json({ error: 'Ticket is already resolved, please open a new ticket' });
      }

      // Check if the ticket status is being set to resolved
      if (ticketStatus === TicketStatus.RESOLVED.toString() && !ticketResponse) {
          return res.status(400).json({ error: 'Ticket response is required for resolved status' });
      }

      // Create a new ticket entry with updated status, response
      const newTicketData = {
          username: existingTicket.username,
          email: existingTicket.email,
          ticketDescription: existingTicket.ticketDescription,
          ticketStatus,
          ticketResponse, // Include ticketResponse in the updated data
          createdAt: existingTicket.createdAt,
          updatedAt
      };
      const updatedTicket = await insertTicketData(newTicketData);

      // If the ticket is resolved and a response is provided, send an email
      if (ticketStatus === TicketStatus.RESOLVED.toString()) {
          console.log(`Email with response (${ticketResponse}) is sent to the user (${existingTicket.email}) who created the ticket.`);
          // Logic to send email (replace with actual implementation)
          // Example: sendEmail(existingTicket.email, 'Ticket Response', ticketResponse);
      }

      res.json({ message: 'Ticket status updated successfully', data: updatedTicket });
  } catch (error) {
      console.error('Error updating ticket status:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});


const server = app.listen(port, () => console.log(`Ticket Server listening on port ${port}!`));
