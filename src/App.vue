<template>
    <v-app id="inspire">
        <v-app-bar
            app
            color="orange"
            flat
            v-if="!showBackend"
        >

            <v-tabs
                centered
                class="ml-n9"
                color="grey darken-1"
                v-model="activeWindow"
            >
                <v-tab
                    v-for="link in links"
                    :key="link"
                >
                    {{ link }}
                </v-tab>
                <v-tab v-if="!user.sessionID">
                    Login
                </v-tab>
                <v-tab v-else>
                    Logout
                </v-tab>
            </v-tabs>

        </v-app-bar>

        <v-main class="grey lighten-3">
            <v-container>
                <v-row>
                    <v-col
                        cols="12"
                        sm="2"
                    >

                    </v-col>

                    <v-col
                        cols="12"
                        sm="8"
                    >
                        <v-scale-transition>
                            <v-alert
                                :type="message.color"
                                v-if="message.text"
                            >{{ message.text }}</v-alert>
                        </v-scale-transition>
                        <v-sheet
                            min-height="70vh"
                            rounded="lg"
                        >

                            <v-overlay
                                :value="loading"
                                absolute
                            >
                                <v-progress-circular
                                    indeterminate
                                    size="64"
                                ></v-progress-circular>
                            </v-overlay>

                            <v-window
                                v-model="activeWindow"
                                v-if="!showBackend"
                            >

                                <v-window-item>
                                    <v-container class="pa-8">
                                        <div class="text-h2">
                                            Olá {{ user.name }}!
                                        </div>
                                        <div class="text-h6 mt-6 text-center">
                                            Esta é uma aplicação para treino/estudo da Virtualização de Serviços!
                                        </div>
                                        <div class="body-1 mt-6 text-center">
                                            Utilize o menu superior para realizar as operações. <br>
                                            As informações são salvas no arquivo "data.json". <br><br>
                                            Em caso de dúvidas, consulte a documentação ou entre em contato com nossa equipe:
                                        </div>
                                        <div class="mt-12 text-center">
                                            <a href="http://virtualizacaoservicos.itau">
                                                <v-btn
                                                    outlined
                                                    text
                                                    color="primary"
                                                    x-large
                                                    width="40%"
                                                >
                                                    Confluence
                                                </v-btn>
                                            </a>
                                        </div>
                                        <div class="mt-6 text-center">
                                            <v-btn
                                                outlined
                                                text
                                                color="primary"
                                                x-large
                                                width="40%"
                                            >
                                                E-Mail Virtualização
                                            </v-btn>
                                        </div>
                                        <div class="mt-6 text-center">
                                            <v-btn
                                                outlined
                                                text
                                                color="error"
                                                x-large
                                                width="40%"
                                                @click="showBackend = true"
                                            >
                                                Backend
                                            </v-btn>
                                        </div>
                                    </v-container>
                                </v-window-item>

                                <v-window-item>
                                    <v-container>
                                        <v-card
                                            height="400"
                                            width="600"
                                            class="mx-auto mt-10"
                                        >
                                            <v-sheet
                                                class="v-sheet--offset mx-auto"
                                                color="cyan"
                                                elevation="12"
                                                max-width="calc(100% - 32px)"
                                            >
                                                <v-sparkline
                                                    line-width="1"
                                                    padding="12"
                                                    smooth="8"
                                                    color="white"
                                                    :value="sparkItems"
                                                    :labels="sparkItems"
                                                    auto-draw
                                                ></v-sparkline>

                                            </v-sheet>
                                            <v-card-text class="text-center pt-12">
                                                <div class="text-h4">Olá {{user.name}}!</div>
                                                <div class="text-h5">O seu saldo atual é de:</div>
                                                <div class="text-h4 primary--text mt-4">R$ {{ balance | value }}</div>
                                            </v-card-text>
                                        </v-card>

                                    </v-container>
                                </v-window-item>

                                <v-window-item>

                                    <v-timeline
                                        align-top
                                        dense
                                        class="ml-16"
                                    >
                                        <v-timeline-item
                                            small
                                            color="orange"
                                            v-for="(item, index) of items"
                                            :key="index"
                                        >
                                            <v-row class="pt-1">
                                                <v-col cols="3">
                                                    {{item.date}}
                                                </v-col>
                                                <v-col>
                                                    <strong :class="{'red--text': (item.value < 0)}">R$ {{item.value | value}}</strong>
                                                    <div class="body-2">
                                                        {{item.description}}
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </v-timeline-item>
                                    </v-timeline>

                                </v-window-item>
                                <v-window-item>
                                    <v-container>
                                        <v-card
                                            height="330"
                                            width="500"
                                            class="mx-auto"
                                        >
                                            <v-card-text class="text-center">
                                                <div class="text-h5">Quanto você gostaria de depositar?</div>
                                                <div class="ma-10">
                                                    <v-text-field
                                                        v-model="move.value"
                                                        label="Valor"
                                                        prefix="R$"
                                                    ></v-text-field>
                                                    <v-text-field
                                                        v-model="move.description"
                                                        label="Descrição"
                                                    ></v-text-field>
                                                </div>
                                                <div>
                                                    <v-btn
                                                        color="primary"
                                                        @click="sendMove(true)"
                                                    >Enviar</v-btn>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-container>
                                </v-window-item>
                                <v-window-item>
                                    <v-container>
                                        <v-card
                                            height="330"
                                            width="500"
                                            class="mx-auto"
                                        >
                                            <v-card-text class="text-center">
                                                <div class="text-h5">Quanto você gostaria de sacar?</div>
                                                <div class="ma-10">
                                                    <v-text-field
                                                        v-model="move.value"
                                                        label="Valor"
                                                        prefix="R$"
                                                    ></v-text-field>
                                                    <v-text-field
                                                        v-model="move.description"
                                                        label="Descrição"
                                                    ></v-text-field>
                                                </div>
                                                <div>
                                                    <v-btn
                                                        color="primary"
                                                        @click="sendMove(false)"
                                                    >Enviar</v-btn>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-container>
                                </v-window-item>

                                <v-window-item>
                                    <v-container>
                                        <v-card
                                            height="250"
                                            width="500"
                                            class="mx-auto"
                                        >
                                            <v-card-text class="text-center">
                                                <div class="text-h5">Configurações</div>
                                                <div class="ma-10">
                                                    <v-text-field
                                                        label="Backend"
                                                        v-model="backend"
                                                    ></v-text-field>
                                                </div>
                                                <div>
                                                    <v-btn
                                                        color="primary"
                                                        @click="saveConfig()"
                                                    >Salvar</v-btn>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-container>
                                </v-window-item>

                                <v-window-item>
                                    <v-container>
                                        <v-card
                                            height="330"
                                            width="500"
                                            class="mx-auto"
                                        >
                                            <v-card-text class="text-center">
                                                <div class="text-h5">Login</div>
                                                <div class="ma-10">
                                                    <v-text-field
                                                        label="Conta"
                                                        v-model="user.account"
                                                        maxlength="6"
                                                    ></v-text-field>
                                                    <v-text-field
                                                        type="password"
                                                        label="Senha"
                                                        v-model="user.pwd"
                                                    ></v-text-field>
                                                </div>
                                                <div>
                                                    <v-btn
                                                        color="primary"
                                                        @click="login()"
                                                    >Enviar</v-btn>
                                                </div>
                                            </v-card-text>
                                        </v-card>
                                    </v-container>
                                </v-window-item>
                            </v-window>
                            <v-container v-else>
                                <v-container class="pa-8">
                                    <v-card
                                        class="mx-auto"
                                        width="320"
                                        height="100"
                                    >
                                        <v-card-text :class="{'text-h4': true, 'text-center': true, 'pt-6': true, 'error--text': !backendRunning, 'success--text': backendRunning}">
                                            {{backendStatus}}
                                        </v-card-text>
                                    </v-card>
                                    <div class="mt-6 text-center">
                                        <v-btn
                                            outlined
                                            text
                                            color="primary"
                                            x-large
                                            width="40%"
                                            @click="backendAction()"
                                        >
                                            {{nextBackendAction}}
                                        </v-btn>
                                    </div>
                                    <div class="mt-6 text-center">
                                        <v-btn
                                            outlined
                                            text
                                            color="primary"
                                            x-large
                                            width="40%"
                                            @click="showBackend = false"
                                        >
                                            Voltar ao Frontend
                                        </v-btn>
                                    </div>
                                </v-container>
                            </v-container>

                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>

import axios from 'axios';

export default {
    data: () => ({
        loading: false,

        showBackend: false,
        backendRunning: true,
        backend: 'http://localhost:8989/virtbank',

        activeWindow: 0,
        message: {
            text: '',
            color: ''
        },

        user: {
            sessionID: '',
            account: '',
            name: '',
            email: '',
            pwd: ''
        },

        move: {
            value: 0,
            description: ''
        },

        balance: 0,
        items: [],

        links: [
            'Home',
            'Saldo',
            'Extrato',
            'Depositar',
            'Sacar',
            'Configurações'
        ],
    }),
    computed: {
        sparkItems() {
            const values = [];
            let initValue = 0;
            this.items.forEach(element => {
                initValue += element.value;
                values.push(initValue);
            });
            return values;
        },
        backendStatus() {
            return (this.backendRunning ? 'Backend no Ar!' : 'Backend Parado!');
        },
        nextBackendAction() {
            return (this.backendRunning ? 'Parar Backend' : 'Subir Backend');
        }
    },
    watch: {
        activeWindow() {
            this.loading = true;
            this.items = [];
            this.balance = 0;

            // SALDO ou EXTRATO
            if (this.activeWindow == 1 || this.activeWindow == 2) {
                if (!this.user.sessionID) {
                    this.showMessage('Você não está logado...', 'error');
                    this.activeWindow = 6;
                }
                else {
                    axios.post(`${this.backend}/saldo`, { sessionID: this.user.sessionID }).then(res => {
                        this.balance = res.data.balance;
                    }).catch(error => {
                        this.showMessage(error.message, 'error');
                    });

                    axios.post(`${this.backend}/extrato`, { sessionID: this.user.sessionID }).then(res => {
                        this.items = res.data.items;
                    }).catch(error => {
                        this.showMessage(error.message, 'error');
                    });
                }
            }
            // DEPOSITAR ou SACAR
            else if (this.activeWindow == 3 || this.activeWindow == 4) {
                if (!this.user.sessionID) {
                    this.showMessage('Você não está logado...', 'error');
                    this.activeWindow = 6;
                }
            }
            // LOGOUT
            else if (this.activeWindow == 6) {
                this.user.sessionID = '';
            }

            setTimeout(() => { this.loading = false; }, 500);
        }
    },
    methods: {
        showMessage(msg, color) {
            this.message.text = msg;
            this.message.color = color;
            setTimeout(() => { this.message.text = ''; }, 2000);
        },
        login() {
            axios.post(`${this.backend}/login`, {
                accountNumber: this.user.account,
                pwd: this.user.pwd
            }).then(res => {
                this.user.sessionID = res.data.sessionID;
                this.user.name = res.data.name;
                this.showMessage('Login efetuado com sucesso!', 'success');
                this.activeWindow = 0;
            }).catch(err => {
                this.showMessage('Usuário ou Senha inválidos', 'error');
            });
        },
        sendMove(deposit) {
            this.items = [];
            this.balance = 0;

            if (deposit) {
                axios.post(`${this.backend}/depositar`, { sessionID: this.user.sessionID, value: this.move.value, description: this.move.description }).then(res => {
                    this.showMessage('Deposito efetuado com sucesso!', 'success');
                    this.activeWindow = 1;
                    this.move.value = 0;
                    this.move.description = '';
                }).catch(error => {
                    this.showMessage(error.message, 'error');
                });
            }
            else {
                axios.post(`${this.backend}/saque`, { sessionID: this.user.sessionID, value: this.move.value, description: this.move.description }).then(res => {
                    this.showMessage('Saque efetuado com sucesso!', 'success');
                    this.activeWindow = 1;
                    this.move.value = 0;
                    this.move.description = '';
                }).catch(error => {
                    this.showMessage(error.message, 'error');
                });
            }

        },
        saveConfig() {
            this.showMessage('Configurações salvas com sucesso!', 'success');
            this.activeWindow = 0;
        },
        backendAction() {
            this.loading = true;
            setTimeout(() => {
                axios.post(`/virtbank/backend`, { run: !this.backendRunning }).then(res => {
                    this.loading = false;
                    this.backendRunning = !this.backendRunning;
                }).catch(error => {
                    this.showMessage(error.message, 'error');
                    this.loading = false;
                    this.backendRunning = false;
                });
            }, 2000);
        }
    },
    filters: {
        value(val) {
            let newVal = new String(val);
            if (newVal.indexOf('.') > -1) newVal = newVal.replace('.', ',');
            else newVal += ',00';

            newVal = newVal.split(',');
            let val1 = newVal[0];
            let val2 = newVal[1];

            if (val1.charAt(0) != '-' && val1.length > 3) val1 = val1.substring(0, 1) + '.' + val1.substring(1);
            else if (val1.charAt(0) == '-' && val1.length > 4) val1 = '-' + val1.substring(1, 2) + '.' + val1.substring(2);

            if (val2.length < 2) val2 += '0';
            return val1 + ',' + val2;
        }
    }
}
</script>