var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { PORT } from './config.js';
import { setupServer } from './server.js';
import { PGDatabase } from './pg-database.js';
let database = new PGDatabase();
const setup = setupServer();
setup.get('/item', (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const type = (_b = request.query.type) === null || _b === void 0 ? void 0 : _b.split('|');
    return database.itemsWithSpecification({ progress: 'notStarted', parent: null, type });
}));
const server = setup.finalize();
server.listenAtPort((_a = parseInt(PORT !== null && PORT !== void 0 ? PORT : '80')) !== null && _a !== void 0 ? _a : 80);
process.stdout.write(`\x1B[35mListening on port \x1B[30m${PORT !== null && PORT !== void 0 ? PORT : '80'}\x1B[0m\n\n`);
export function close() {
    server.stopListening();
}
export function overrideDatabase(testDatabase) {
    database = testDatabase;
}
