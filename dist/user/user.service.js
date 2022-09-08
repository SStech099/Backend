"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
let UserService = class UserService {
    handleCron() {
        const Big = require('big.js');
        const blk = require('./blockchain');
        const UniswapV2Pair = require('./abi/IUniswapV2Pair.json');
        const PAIR_ADDR = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
        const PAIR_NAME = 'ETH/DAI';
        const INTERVAL = 1000;
        const PairContractHTTP = new blk.web3http.eth.Contract(UniswapV2Pair.abi, PAIR_ADDR);
        const getReserves = async (ContractObj) => {
            const _reserves = await ContractObj.methods.getReserves().call();
            return [Big(_reserves.reserve0), Big(_reserves.reserve1)];
        };
        const sleep = (timeInMs) => new Promise((resolve) => setTimeout(resolve, timeInMs));
        const main = async () => {
            while (true) {
                const [amtToken0, amtToken1] = await getReserves(PairContractHTTP);
                console.log(`Price ${PAIR_NAME} : ${amtToken0.div(amtToken1).toString()}`);
                await sleep(INTERVAL);
            }
        };
        main();
    }
};
UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map