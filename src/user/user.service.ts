import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UniswapFactoryAbi } from './abi/IUniswapV2Factory';
import { UniswapPairAbi } from './abi/IUniswapV2Pair';
import { Cron, CronExpression } from '@nestjs/schedule';
const Big = require('big.js');

import Web3 from 'web3';
@Injectable()
export class OrdersService {
  web3SocketConnection: any;
  constructor(private configService: ConfigService) {
    const web3 = new Web3();
    this.fetchPrice();
  }

  async onModuleInit() {
    this.initiatewebSocket();
  }

  async initiatewebSocket() {
    const reconnectOptions = {
      timeout: 30000,
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
        keepalive: true,
        keepaliveInterval: -1,
      },

      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 99999999,
        onTimeout: true,
      },
    };

    this.web3SocketConnection = new Web3.providers.WebsocketProvider(
      this.configService.get('WEB3_WSS_PROVIDER'),
      reconnectOptions,
    );

    console.log('hi');
    this.web3SocketConnection.on('connect', () => {
      console.log('! provider connected'); // <- fires after successful connection
      this.startListeningEvents();
    });

    this.web3SocketConnection.on('error', function (err) {
      console.log('~ on-error:', err); // <- never fires
      this.initiatewebSocket();
    });

    this.web3SocketConnection.on('end', async (err) => {
      console.log('~ on-end:', err); // <- never fires
      this.initiatewebSocket();
    });

    this.web3SocketConnection.on('close', (event) => {
      console.log('~ on-close:', event); // <- never fires
      this.initiatewebSocket();
    });
  }

  async getPair(token1, token2) {
    console.log('In fetch price');
    const FACTORY_ADDRESS = this.configService.get('FACTORY_CONTRACT_ADDRESS');
    const HTTP_URL = this.configService.get('HTTP_URL');
    const web3http = new Web3(HTTP_URL);
    console.log(HTTP_URL);
    // console.log(FACTORY_ADDRESS, WETH_ADDRESS, DAI_ADDRESS);

    const FactoryContractHTTP = new web3http.eth.Contract(
      UniswapFactoryAbi,
      FACTORY_ADDRESS,
    );

    const pair = await FactoryContractHTTP.methods
      .getPair(token1, token2)
      .call();
    return pair;
  }

  async fetchPrice() {
    const WETH_ADDRESS = process.env.WETH_CONTRACT_ADDRESS;
    const DAI_ADDRESS = process.env.DAI_CONTRACT_ADDRESS;
    const HTTP_URL = process.env.HTTP_URL;
    const web3http = new Web3(HTTP_URL);
    const pair = await this.getPair(WETH_ADDRESS, DAI_ADDRESS);
    const pairContractHTTP = new web3http.eth.Contract(UniswapPairAbi, pair);
    console.log(pair);

    const getReserves = async (ContractObj) => {
      const _reserves = await ContractObj.methods.getReserves().call();
      return [Big(_reserves.reserve0), Big(_reserves.reserve1)];
    };

    const [amtToken0, amtToken1] = await getReserves(pairContractHTTP);

    console.log(
      `Price of current pair : ${(amtToken0 / amtToken1).toString()}`,
    );
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.fetchPrice();
  }
}
