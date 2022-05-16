import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

admin.initializeApp();  // need this.

export const addAdminRole = functions.https.onCall( (data, context) => {
    // make sure only an admin can do this
    if (context.auth?.token.admin != true) {
        return { error: 'only admins allowed to do this'};
    }

    // get user and add custom claim (admin)
    return admin.auth().getUserByEmail(data.email).then(user => {
        return admin.auth().setCustomUserClaims(user.uid, {
            admin: true
        })
    }).then(() => {
        return {
            message: `success! ${data.email} has been made an admin`
        }
    }).catch (err => {
        return err;
    });
});

export const addPremiumRole = functions.https.onCall( (data, context) => {
    if (context.auth?.token.admin != true) {
        return { error: 'only admins allowed to do this'};
    }

    // get user and add custom claim (admin)
    return admin.auth().getUserByEmail(data.email).then(user => {
        if (user.customClaims && (user.customClaims as any).premium === true) {
            return; // already premium
        }
        return admin.auth().setCustomUserClaims(user.uid, {
            premium: true
        })
    }).then(() => {
        return {
            message: `success! ${data.email} has been made a premium user`
        }
    }).catch (err => {
        return err;
    });
});

export const addPremiumPaidUpRole = functions.https.onCall( (data, context) => {
    if (context.auth?.token.admin != true) {
        return { error: 'only admins allowed to do this'};
    }

    // get user and add custom claim (admin)
    return admin.auth().getUserByEmail(data.email).then(user => {
        if (user.customClaims && (user.customClaims as any).premiumPaidUp === true) {
            return; // already premium
        }
        return admin.auth().setCustomUserClaims(user.uid, {
            premiumPaidUp: true
        })
    }).then(() => {
        return {
            message: `success! ${data.email} has been made a premium user - paid up`
        }
    }).catch (err => {
        return err;
    });
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
