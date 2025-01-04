// server/routes/jamRoutes.js
import express from 'express'
import Jam from '../models/Jam.js'
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router()

// Helper function to generate a QR code
async function generateQRCode(url) {
    try {
        return await QRCode.toDataURL(url);
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

// generate a join URL
function generateJoinUrl(sessionId) {
    // You'll want to replace this with your actual frontend URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${baseUrl}/join/${sessionId}`;
}

//route to create a new jam session
router.post('/create', async (req, res) => {
    try {
        // future implementation:???
        // const jamData = await createNewJam(req.body.host, req.body.config);
        // res.status(201).json(jamData);
        // create a file services/jamServices.js
        // then handle jam creation logic in there instead
        // ex) export async function createNewJam(hostData, configData) { ......


        const { host, config } = req.body;
        // console.log(host);
        const hostParticipantId = uuidv4();
        const hostName = host.name;
        // console.log(hostName);

        // Create a new jam session
        const jam = new Jam({
            name: `${hostName}'s Jam`,  // customize this
            host: {
                name: hostName,
                participantId: hostParticipantId,
                joinedAt: new Date()
            },
            status: 'waiting',
            config: {
                timeBetweenSongs: config.timeBetweenSongs,
                singersPerRound: config.singersPerRound
            },
            participants: [{
                name: hostName,
                participantId: hostParticipantId,
                joinedAt: new Date()
            }]
            
        });

        // Generate join URL and QR code
        const joinUrl = generateJoinUrl(jam._id);
        const qrCode = await generateQRCode(joinUrl);

        // Add the sharing information to the jam
        jam.joinUrl = joinUrl;
        jam.qrCode = qrCode;

        // Save the jam to the database
        await jam.save();

        console.log("jam created:");
        console.log(jam);

        console.log("Data sent back:")
        console.log({
            hostId: hostParticipantId,
            sessionId: jam._id,
            joinUrl,
            qrCode,
            config: jam.config
        });

        // Send back the necessary data
        res.status(201).json({
            hostId: hostParticipantId,
            sessionId: jam._id,
            joinUrl,
            qrCode,
            config: jam.config
        });
    } catch (error){
        console.log(error);
        res.status(500).json({ error: 'Failed to create jam session' });
    }
});


// ______________________________________________________________
// ______________________________________________________________
// ______________________________________________________________
// Route to join an existing jam
router.post('/join-jam', async (req, res) => {
    try {
        const { name, sessionId, isHost, joinedAt } = req.body;
    
        // Find the jam session using sessionId
        const jam = await Jam.findById(sessionId);
        
        if (!jam) {
          return res.status(404).json({ error: 'Jam session not found' });
        }

        // future implementation
        // let a user join a jam if it is still playing
        if (jam.status !== 'waiting') {
            return res.status(400).json({ error: 'This jam session is no longer accepting new participants' });
        }

        // Generate a unique participant ID
        const participantId = uuidv4();

        // Add the new participant
        await jam.addParticipant({
            name,
            participantId
        });

        res.status(200).json({
            participantId,
            sessionId: jam._id,
            jamName: jam.name,
            hostName: jam.hostName
        });

    } catch (error) {
        console.error('Error joining jam:', error);
        res.status(500).json({ error: 'Failed to join jam session' });
    }
});

// Route to get jam session details
// future implement: fix this...
router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const jam = await Jam.findById(sessionId);
        
        if (!jam) {
            return res.status(404).json({ error: 'Jam session not found' });
        }

        // or
        // res.json(jam);

        res.status(200).json({
            _id: jam._id,
            name: jam.name,
            host: {
              name: jam.host.name,
              participantId: jam.host.participantId
            },
            joinUrl: jam.joinUrl,
            qrCode: jam.qrCode,
            participants: jam.participants,
            status: jam.status,
            config: jam.config
          });

        

    } catch (error) {
        console.error('Error fetching jam details:', error);
        res.status(500).json({ error: 'Failed to fetch jam details' });
    }
});

// Route to start the jam (move from waiting to active)
router.post('/:sessionId/start', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { hostId } = req.body;  // To verify the request is from the host

        const jam = await Jam.findById(sessionId);
        // console.log('found jam: ');
        // console.log(jam);
        
        if (!jam) {
            return res.status(404).json({ error: 'Jam session not found' });
        }

        // Verify the request is from the host
        if (jam.host.participantId !== hostId) {
            return res.status(403).json({ error: 'Only the host can start the jam' });
        }

        await jam.startJam();

        res.status(200).json({
            message: 'Jam session started successfully',
            startedAt: jam.startedAt
        });

    } catch (error) {
        console.error('Error starting jam:', error);
        res.status(500).json({ error: 'Failed to start jam session' });
    }
});

export default router