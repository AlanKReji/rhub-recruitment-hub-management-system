import mongoose from 'mongoose';
const prefixCounterSchema = new mongoose.Schema({
  prefix: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});
const PrefixCounter = mongoose.model('PrefixCounter', prefixCounterSchema);
export default PrefixCounter;