const DB_NAME = 'chat'
const DB_VERSION = 2

let db = null

// 初始化数据库
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      createStores(db)
    }
  })
}

// 创建数据库存储对象
const createStores = (db) => {
  // 用户表
  if (!db.objectStoreNames.contains('users')) {
    const userStore = db.createObjectStore('users', { keyPath: 'id' })
    userStore.createIndex('username', 'username', { unique: true })
  }

  // AI角色表
  if (!db.objectStoreNames.contains('characters')) {
    const characterStore = db.createObjectStore('characters', { keyPath: 'id' })
    characterStore.createIndex('name', 'name')
    characterStore.createIndex('createdBy', 'createdBy')
  }

  // 聊天表
  if (!db.objectStoreNames.contains('chats')) {
    const chatStore = db.createObjectStore('chats', { keyPath: 'id' })
    chatStore.createIndex('type', 'type')
    chatStore.createIndex('createdBy', 'createdBy')
    chatStore.createIndex('createdAt', 'createdAt')
  }

  // 聊天成员关系表
  if (!db.objectStoreNames.contains('chat_members')) {
    const memberStore = db.createObjectStore('chat_members', { keyPath: 'id' })
    memberStore.createIndex('chatId', 'chatId')
    memberStore.createIndex('memberId', 'memberId')
    memberStore.createIndex('chatId_memberId', ['chatId', 'memberId'], {
      unique: true,
    })
  }

  // 消息表
  if (!db.objectStoreNames.contains('messages')) {
    const messageStore = db.createObjectStore('messages', { keyPath: 'id' })
    messageStore.createIndex('chatId', 'chatId')
    messageStore.createIndex('createdBy', 'createdBy')
    messageStore.createIndex('createdAt', 'createdAt')
  }
}

// 数据库操作
export const dbOperation = async (storeName, mode, operation) => {
  await initDB()

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode)
      const store = transaction.objectStore(storeName)
      const request = operation(store)

      if (request instanceof Promise) {
        request
          .then((result) => {
            transaction.oncomplete = () => resolve(result)
          })
          .catch((error) => reject(error))
      } else {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }

      transaction.onerror = () => reject(transaction.error)
    } catch (error) {
      reject(error)
    }
  })
}

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}
