
import { onRequest } from 'firebase-functions/v2/https'
import { goals_db } from './init'


export const getUserGoalDetails = onRequest( async (req, res) => {
    if (req.method !== 'POST') {
        res.status(400).send('Please send a POST request')
        return
    }
    const { id } = req.body


    if (!id) {
        res.status(400).send('Please provide an id')
        return
    }


    try {
        const snapshot = await goals_db.collection('goals').doc(id).get()

        if (!snapshot.exists) {
            res.status(404).send(`This gaol doesn't exist`)
            return
        }



        const goalData = snapshot.data()!

        const userDataObj = (await goals_db.collection('users').doc(goalData.user_id).get()).data()!

        const userData = {
            id: userDataObj.id,
            name: userDataObj.name,
            username: userDataObj.username,
            photo_url: userDataObj.photo_url,
        }

        res.status(200).send({
            ...goalData,
            user: userData,
        })



    } catch (error: any) {
        console.error(error);
        res.status(500).send({
            message: 'An error occurred',
            error: error,
            msg: error.message,
        })
    }
})

