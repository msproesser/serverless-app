export default class Block {

    constructor({index, hash, transactions, address}) {
        this.index = index
        this.hash = hash
        this.transactions = transactions
        this.address = address
    }
}