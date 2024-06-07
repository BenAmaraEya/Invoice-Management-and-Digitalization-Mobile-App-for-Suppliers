


const cron = require('node-cron');
const Bordereau = require('./models/Bordereau');
const Facture = require('./models/Facture');

// creation des bordereau d'un maniere automatique a chaque minuit
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Starting automatic bordereau creation process...');

        // récupérer toutes les natures distinctes des factures existantes
        const natures = await Facture.aggregate('nature', 'DISTINCT', { plain: false });

        console.log(`Found ${natures.length} distinct natures:`, natures);

        // recupere le date d'aujourd'hui sans les heures
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        // iter sur chaque nature
        for (const { DISTINCT: nature } of natures) {
            console.log(`Checking for existing bordereau for nature: ${nature}`);

          //verifier si il'ya une facture cree avec le date d'aujourd'hui et nature  
            let existingBordereau = await Bordereau.findOne({
                where: {
                    nature,
                    date: today 
                }
            });

            // si aucun bordereau existe il crée un nouveau bordereau avec cette nature 
            if (!existingBordereau) {
                console.log(`Creating new bordereau for nature: ${nature}`);
                existingBordereau = await Bordereau.create({ nature, date: today });
                console.log(`Created bordereau for nature ${nature}`);
            } else {
                console.log(`Bordereau already exists for nature ${nature}`);
            }
        }

        console.log('Automatic bordereau creation process completed.');
    } catch (error) {
        console.error('Error creating automatic bordereaux:', error);
    }
}, {
    timezone: 'Africa/Tunis'
});
