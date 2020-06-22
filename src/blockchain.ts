import Block from './block'
import AccountState from './account-state'
import SHA256 from 'crypto-js/sha256'
import PeerId from 'peer-id'

interface Transaction {
    from: string
    to: string
    amount: number
    sign: string
}

function genesis() {
    const genesisTx = {
        from: '',
        to: 'CAESICam8THP7BRQfPjmvLv1lTALrzs/8jhbK2P5QfjpCePY',
        amount: 100,
        fee: 0,
        sign: ''
    }
    return new Block({index: 0, hash: 0, transactions: [genesisTx], address: 0})
}

export default class Blockchain {

    private chain: Block[]
    private state: AccountState
    private transactions: Transaction[]

    constructor() {
        this.chain = [genesis()]
        this.state = new AccountState()
        this.transactions = []
    }

    async _isValidTransaction(transaction: Transaction) : Promise<boolean> {
        if (!transaction.to || !transaction.amount) {
            return false
        }
        return PeerId.createFromPubKey(transaction.from).then(fromId => {
            const msg = Buffer.from(JSON.stringify({
                to: transaction.to,
                amount: transaction.amount
            }))
            const sign = Buffer.from(transaction.sign, 'base64')
            return fromId.pubKey.verify(msg, sign)
        })
    }

    async addTransaction(transaction: Transaction) : Promise<boolean> {
        const isValid = await this._isValidTransaction(transaction)
        if (!isValid) {
            console.log('invalid transaction')
            return false
        } 
        this.state.update(transaction)
        this.transactions.push(transaction)
        return true
    }

    addBlock(block: Block) {
        this.chain.push(block)
        this.transactions = []
        return block
    }

    lastHash() {
        const lastBlock = this.chain[this.chain.length-1]
        return SHA256(JSON.stringify(lastBlock)).toString()
    }
}