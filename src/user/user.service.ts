import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserService {
  handleCron() {
    const Big = require('big.js');
    const blk = require('./blockchain');
    const UniswapV2Pair = require('./abi/IUniswapV2Pair.json');

    const PAIR_ADDR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
    const PAIR_NAME = 'ETH/DAI';
    const INTERVAL = 1000;

    const PairContractHTTP = new blk.web3http.eth.Contract(
      UniswapV2Pair.abi,
      PAIR_ADDR,
    );

    //Function to get reserves
    const getReserves = async (ContractObj) => {
      //call getReserves of the pair contract
      const _reserves = await ContractObj.methods.getReserves().call();

      //return data in Big Number
      return [Big(_reserves.reserve0), Big(_reserves.reserve1)];
    };

    const sleep = (timeInMs) =>
      new Promise((resolve) => setTimeout(resolve, timeInMs));

    const main = async () => {
      //Check price continously
      while (true) {
        const [amtToken0, amtToken1] = await getReserves(PairContractHTTP);

        //calculate price and print
        console.log(
          `Price ${PAIR_NAME} : ${amtToken0.div(amtToken1).toString()}`,
        );
        await sleep(INTERVAL);
      }
    };

    main();
  }
}
