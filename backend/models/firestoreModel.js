import { db } from '../config/firebase.js';
import bcrypt from 'bcryptjs';

class DocumentInstance {
  constructor(collectionName, id, data) {
    this._id = id;
    this.id = id;
    this._collectionName = collectionName;
    Object.assign(this, data);
  }

  // Mimic Mongoose schema methods
  async save() {
    // Generate product slug if name exists
    if (this._collectionName === 'products' && this.name) {
      this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Hash password if set and not already hashed
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const cleanData = { ...this };
    delete cleanData._id;
    delete cleanData.id;
    delete cleanData._collectionName;
    
    // Add default timestamps
    cleanData.updatedAt = new Date().toISOString();
    if (!cleanData.createdAt) {
      cleanData.createdAt = new Date().toISOString();
    }

    await db.collection(this._collectionName).doc(this.id).set(cleanData, { merge: true });
    return this;
  }

  async update(data) {
    Object.assign(this, data);
    await this.save();
    return this;
  }

  async delete() {
    await db.collection(this._collectionName).doc(this.id).delete();
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Minimal select/populate chain simulation
  select() {
    return this;
  }

  populate() {
    return this;
  }
}

export class FirestoreModel {
  constructor(collectionName, defaults = {}) {
    this.collectionName = collectionName;
    this.defaults = defaults;
  }

  async findOne(query = {}) {
    if (query.$or && Array.isArray(query.$or)) {
      for (const cond of query.$or) {
        const doc = await this.findOne(cond);
        if (doc) return doc;
      }
      return null;
    }

    let ref = db.collection(this.collectionName);
    
    // Convert Mongoose queries like { _id: ... } or { email: ... }
    const entries = Object.entries(query);
    if (entries.length === 0) {
      const snapshot = await ref.limit(1).get();
      if (snapshot.empty) return null;
      return new DocumentInstance(this.collectionName, snapshot.docs[0].id, snapshot.docs[0].data());
    }

    for (let [key, value] of entries) {
      if (key === '_id' || key === 'id') {
        return this.findById(value);
      }
      ref = ref.where(key, '==', value);
    }

    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return new DocumentInstance(this.collectionName, doc.id, doc.data());
  }

  async findById(id) {
    if (!id) return null;
    const docId = id.toString();
    const doc = await db.collection(this.collectionName).doc(docId).get();
    if (!doc.exists) return null;
    return new DocumentInstance(this.collectionName, doc.id, doc.data());
  }

  async find(query = {}) {
    if (query.$or && Array.isArray(query.$or)) {
      let results = [];
      const seen = new Set();
      for (const cond of query.$or) {
        const chain = await this.find(cond);
        for (const doc of chain.docs) {
          if (!seen.has(doc.id)) {
            seen.add(doc.id);
            results.push(doc);
          }
        }
      }
      return {
        docs: results,
        select: function() { return this; },
        sort: function() { return this; },
        populate: function() { return this; },
        then: function(onfulfilled) {
          return Promise.resolve(this.docs).then(onfulfilled);
        }
      };
    }

    let ref = db.collection(this.collectionName);
    for (const [key, value] of Object.entries(query)) {
      if (key === '_id' || key === 'id') {
        const doc = await this.findById(value);
        return doc ? [doc] : [];
      }
      if (typeof value === 'object' && value !== null) {
        // Handle mongoose operators like $ne, $in, $gte, etc.
        const ops = Object.keys(value);
        if (ops.includes('$ne')) {
          ref = ref.where(key, '!=', value.$ne);
        } else if (ops.includes('$in')) {
          ref = ref.where(key, 'in', value.$in);
        }
        continue;
      }
      ref = ref.where(key, '==', value);
    }
    const snapshot = await ref.get();
    const list = snapshot.docs.map(doc => new DocumentInstance(this.collectionName, doc.id, doc.data()));

    // Add Mongoose compatibility query builders (.select(), .sort(), .populate())
    const chain = {
      docs: list,
      select: function() { return this; },
      sort: function() { return this; },
      populate: function() { return this; },
      then: function(onfulfilled) {
        return Promise.resolve(this.docs).then(onfulfilled);
      }
    };

    return chain;
  }

  async create(data) {
    let mergedData = { ...this.defaults, ...data };
    mergedData.createdAt = new Date().toISOString();
    mergedData.updatedAt = new Date().toISOString();

    if (mergedData.password) {
      const salt = await bcrypt.genSalt(10);
      mergedData.password = await bcrypt.hash(mergedData.password, salt);
    }

    if (this.collectionName === 'products' && mergedData.name) {
      mergedData.slug = mergedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const docRef = await db.collection(this.collectionName).add(mergedData);
    return new DocumentInstance(this.collectionName, docRef.id, mergedData);
  }

  async insertMany(arr) {
    const list = [];
    for (const data of arr) {
      const doc = await this.create(data);
      list.push(doc);
    }
    return list;
  }

  async findByIdAndUpdate(id, data, options = {}) {
    const docId = id.toString();
    const docRef = db.collection(this.collectionName).doc(docId);
    
    // Hash password if modifying it
    if (data.password && !data.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    await docRef.set(data, { merge: true });
    const updatedDoc = await docRef.get();
    return new DocumentInstance(this.collectionName, id, updatedDoc.data());
  }

  async findOneAndUpdate(query, data, options = {}) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    return this.findByIdAndUpdate(doc.id, data, options);
  }

  async findByIdAndDelete(id) {
    const docId = id.toString();
    const doc = await this.findById(docId);
    if (doc) {
      await doc.delete();
    }
    return doc;
  }

  async findOneAndDelete(query) {
    const doc = await this.findOne(query);
    if (doc) {
      await doc.delete();
    }
    return doc;
  }

  async updateMany(query, data) {
    const chain = await this.find(query);
    const docs = chain.docs;
    for (const d of docs) {
      await db.collection(this.collectionName).doc(d.id).update(data);
    }
    return { modifiedCount: docs.length };
  }

  async deleteMany(query) {
    const chain = await this.find(query);
    const docs = chain.docs;
    for (const d of docs) {
      await db.collection(this.collectionName).doc(d.id).delete();
    }
    return { deletedCount: docs.length };
  }

  async countDocuments(query = {}) {
    const chain = await this.find(query);
    return chain.docs.length;
  }
}
