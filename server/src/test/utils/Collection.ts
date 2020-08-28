/**
 * Collection of various utility functions used in tests
 * 
 * @author Paolo Baldini
 */
import { Schema } from 'mongoose'

/**
 * Compares two object ids
 * 
 * @param o1 first id
 * @param o2 second id
 * @return true if the two are equals, false otherwise
 */
export function equals(o1: Schema.Types.ObjectId, o2: Schema.Types.ObjectId) {
    return o1.toString() === o2.toString()
}