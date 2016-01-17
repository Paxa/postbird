var assert = require('assert')

var Reader = module.exports = function(options) {
  //TODO - remove for version 1.0
  if(typeof options == 'number') {
    options = { headerSize: options }
  }
  options = options || {}
  this.offset = 0
  this.lastChunk = false
  this.chunk = null
  this.headerSize = options.headerSize || 0
  this.lengthPadding = options.lengthPadding || 0
  this.header = null
  assert(this.headerSize < 2, 'pre-length header of more than 1 byte length not currently supported')
}

Reader.prototype.addChunk = function(chunk) {
  this.offset = 0
  this.chunk = chunk
  if(this.lastChunk) {
    this.chunk = Buffer.concat([this.lastChunk, this.chunk])
    this.lastChunk = false
  }
}

Reader.prototype._save = function() {
  //save any unread chunks for next read
  if(this.offset < this.chunk.length) {
    this.lastChunk = this.chunk.slice(this.offset)
  }
  return false
}

Reader.prototype.read = function() {
  if(this.chunk.length < (this.headerSize + 4 + this.offset)) {
    return this._save()
  }

  if(this.headerSize) {
    this.header = this.chunk[this.offset]
  }

  //read length of next item
  var length = this.chunk.readUInt32BE(this.offset + this.headerSize) + this.lengthPadding

  //next item spans more chunks than we have
  var remaining = this.chunk.length - (this.offset + 4 + this.headerSize)
  if(length > remaining) {
    return this._save()
  }

  this.offset += (this.headerSize + 4)
  var result = this.chunk.slice(this.offset, this.offset + length)
  this.offset += length
  return result
}
