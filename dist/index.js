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
import { NOT_FOUND, setupServer } from './server.js';
import { PGDatabase } from './pg-database.js';
let database = new PGDatabase();
const setup = setupServer();
setup.get('/item', (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const type = (_b = request.query.type) === null || _b === void 0 ? void 0 : _b.split('|');
    return database.itemsWithSpecification({ progress: 'notStarted', parent: null, type });
}));
setup.get('/item/:id', (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const id = request.params.id;
    return (_c = yield database.item(id)) !== null && _c !== void 0 ? _c : NOT_FOUND;
}));
setup.get('/item/:id/child', (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const id = request.params.id;
    const type = (_d = request.query.type) === null || _d === void 0 ? void 0 : _d.split('|');
    return database.itemsWithSpecification({ progress: 'notStarted', parent: id, type });
}));
const server = setup.finalize();
const port = (_a = parseInt(PORT !== null && PORT !== void 0 ? PORT : '80')) !== null && _a !== void 0 ? _a : 80;
server.listenAtPort(port);
process.stdout.write(`\x1B[35mListening on port \x1B[30m${port}\x1B[0m\n\n`);
export function start(testDatabase) {
    database = testDatabase;
    server.stopListening();
    server.listenAtPort(port);
}
export function stop() {
    server.stopListening();
}
