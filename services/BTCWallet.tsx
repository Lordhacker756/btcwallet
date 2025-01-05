const fetchBalance = async (address: any) => {
  try {
    const response = await axios.get(
      `https://mempool.space/testnet4/api/address/${address}`,
    );
    console.log('Balance response:', response.data);
    const {funded_txo_sum, spent_txo_sum} = response.data.chain_stats;
    const balance = (funded_txo_sum - spent_txo_sum) / 100000000;
    console.log('Balance:', balance);
    setBalance(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
};

export default {fetchBalance};
