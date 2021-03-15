const express = require('express');
const fs = require('fs');
const app = express();
const port = 8989;

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,X-Api-Key,Authorization,X-CM-App');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


const data = JSON.parse(fs.readFileSync('./data.json').toString());
const sessions = [];

function generateSession() {
    let sessionID = Math.random();
    let session = new String(sessionID)
    return session.substring(2);
}

function generateAccount(name, email, pwd) {
    let accountNumber = '';
    for (let i = 0; i < 6; i++) {
        if (i == 4) accountNumber += '-';
        else accountNumber += Math.floor(Math.random() * 9);
    }

    data.push({
        accountNumber,
        user: { name, email, pwd },
        balance: []
    });

    return accountNumber;
}

function validateSession(session) {
    const foundItem = sessions.find(item => item.sessionID === session);
    return foundItem;
}

function saveData() {
    fs.writeFileSync('./data.json', JSON.stringify(data));
}

/**
 * Lista todas as contas
 */
app.post('/contas', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        res.status(200).send(data.map(item => {
            const newItem = item;
            delete newItem.user.pwd;
            delete newItem.balance;
            return newItem;
        }));
    }
});

/**
 * Cria uma conta nova
 */
app.post('/conta', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.body.name && req.body.email && req.body.pwd) {
            const accountNumber = generateAccount(req.body.name, req.body.email, req.body.pwd);
            const account = data.find(item => item.accountNumber === accountNumber);
            delete account.user.pwd;
            delete account.balance;
            res.status(200).send(account);
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }

    }
});

/**
 * Retorna informações de uma conta
 */
app.post('/conta/:accountNumber', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.params.accountNumber) {
            const account = data.find(item => item.accountNumber === req.params.accountNumber);
            if (account) {
                delete account.user.pwd;
                delete account.balance;
                res.status(200).send(account);
            }
            else res.status(404).send({ status: 'Não encontrado' });
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }
    }
});

/**
 * Remove uma conta
 */
app.delete('/conta/:accountNumber', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.params.accountNumber) {
            let foundIndex;
            const account = data.find((item, index) => {
                if (item.accountNumber === req.params.accountNumber) {
                    foundIndex = index;
                    return true;
                }
                return false;
            });

            if (account) {
                data.splice(foundIndex, 1);
                res.status(200).send({ status: 'Ok' });
            }
            else res.status(404).send({ status: 'Não encontrado' });
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }
    }
});

/**
 * Atualiza uma conta
 */
app.put('/conta/:accountNumber', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.body.name && req.body.email && req.body.pwd && req.params.accountNumber) {
            let foundIndex;
            const account = data.find((item, index) => {
                if (item.accountNumber === req.params.accountNumber) {
                    foundIndex = index;
                    return true;
                }
                return false;
            });

            if (account) {
                data[foundIndex].user.name = req.body.name;
                data[foundIndex].user.email = req.body.email;
                data[foundIndex].user.pwd = req.body.pwd;

                res.status(200).send({ status: 'Ok' });
            }
            else res.status(404).send({ status: 'Não encontrado' });
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }
    }
});

/**
 * Retorna o saldo atual da conta
 */
app.post('/saldo', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        const accountSession = sessions.find(item => item.sessionID == req.body.sessionID);
        const account = data.find(item => item.accountNumber == accountSession.accountNumber);

        let balance = 0;
        account.balance.forEach(item => {
            balance += item.value;
        });

        res.status(200).send({ balance });
    }
});

/**
 * Retorna o extrato da conta
 */
app.post('/extrato', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        const accountSession = sessions.find(item => item.sessionID == req.body.sessionID);
        const account = data.find(item => item.accountNumber == accountSession.accountNumber);
        res.status(200).send({ items: account.balance });
    }
});

/**
 * Realiza um deposito na conta
 */
app.post('/depositar', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.body.value, req.body.description) {
            const accountSession = sessions.find(item => item.sessionID == req.body.sessionID);

            let accountIndex;
            const account = data.find((item, index) => {
                if (item.accountNumber == accountSession.accountNumber) {
                    accountIndex = index;
                    return true;
                }
                return false;
            });

            data[accountIndex].balance.push(
                { value: Number(req.body.value), date: "01/01/2021 00:00", description: req.body.description }
            );

            saveData();
            res.status(200).send({ items: account.balance });
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }
    }
});

/**
 * Realiza um deposito na conta
 */
app.post('/saque', (req, res) => {
    if (!validateSession(req.body.sessionID)) {
        res.status(401).send({ status: 'Não autorizado' });
    }
    else {
        if (req.body.value, req.body.description) {
            const accountSession = sessions.find(item => item.sessionID == req.body.sessionID);

            let accountIndex;
            const account = data.find((item, index) => {
                if (item.accountNumber == accountSession.accountNumber) {
                    accountIndex = index;
                    return true;
                }
                return false;
            });

            saveData();
            data[accountIndex].balance.push(
                { value: Number(req.body.value) * -1, date: "01/01/2021 00:00", description: req.body.description }
            );

            res.status(200).send({ items: account.balance });
        }
        else {
            res.status(402).send({ status: 'Invalido' });
        }
    }
});

/**
 * Faz login e retorna um id de sessao
 */
app.post('/login', (req, res) => {

    const foundItem = data.find(item => (item.accountNumber === req.body.accountNumber && item.user.pwd === req.body.pwd));

    if (foundItem) {
        const sessionID = generateSession();
        sessions.push({
            sessionID,
            accountNumber: req.body.accountNumber
        });

        res.status(200).send({ sessionID, name: foundItem.user.name, email: foundItem.user.email });
    }
    else {
        res.status(401).send({ status: 'Não autorizado' });
    }
});

/**
 * Faz logout
 */
app.post('/logout', (req, res) => {

    let foundIndex;
    const foundItem = sessions.find((item, index) => {
        if (item.sessionID === req.body.sessionID) {
            foundIndex = index;
            return true;
        }
        return false;
    });

    if (foundItem) {
        sessions.splice(foundIndex, 1);
        res.status(200).send({ status: 'Ok' });
    }
    else {
        res.status(404).send({ status: 'Não encontrado' });
    }
});


app.listen(port, () => {
    console.log(`Serviço Backend no ar: http://localhost:${port}`);
});

