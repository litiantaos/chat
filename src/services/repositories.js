import { dbOperation, generateId } from './database'

const createItem = async (storeName, data) => {
  const newItem = {
    id: generateId(),
    ...data,
    createdAt: Date.now(),
  }
  await dbOperation(storeName, 'readwrite', (store) => store.add(newItem))
  return newItem
}

const getItemById = async (storeName, id) => {
  return dbOperation(storeName, 'readonly', (store) => store.get(id))
}

const getAllItems = async (storeName) => {
  return dbOperation(storeName, 'readonly', (store) => store.getAll())
}

const getItemsByIndex = async (storeName, indexName, value) => {
  return dbOperation(storeName, 'readonly', (store) =>
    store.index(indexName).getAll(value),
  )
}

const getItemByIndex = async (storeName, indexName, value) => {
  return dbOperation(storeName, 'readonly', (store) =>
    store.index(indexName).get(value),
  )
}

const updateItem = async (storeName, id, data) => {
  const item = await getItemById(storeName, id)
  if (!item) return null

  const updatedItem = {
    ...item,
    ...data,
    updatedAt: Date.now(),
  }

  await dbOperation(storeName, 'readwrite', (store) => store.put(updatedItem))
  return updatedItem
}

const deleteItem = async (storeName, id) => {
  await dbOperation(storeName, 'readwrite', (store) => store.delete(id))
  return true
}

// 用户相关操作
export const createUser = (data) => createItem('users', data)
export const getUserById = (id) => getItemById('users', id)
export const getAllUsers = () => getAllItems('users')
export const updateUser = (id, data) => updateItem('users', id, data)
export const deleteUser = (id) => deleteItem('users', id)
export const getUserByUsername = (username) =>
  getItemByIndex('users', 'username', username)

// 角色相关操作
export const createCharacter = (data) => createItem('characters', data)
export const getCharacterById = (id) => getItemById('characters', id)
export const getAllCharacters = () => getAllItems('characters')
export const updateCharacter = (id, data) => updateItem('characters', id, data)
export const deleteCharacter = (id) => deleteItem('characters', id)
export const getUserCharacters = (userId) =>
  getItemsByIndex('characters', 'createdBy', userId)

// 消息相关操作
export const createMessage = (data) => createItem('messages', data)
export const getMessageById = (id) => getItemById('messages', id)
export const updateMessage = (id, data) => updateItem('messages', id, data)
export const deleteMessage = (id) => deleteItem('messages', id)

export const getChatMessages = async (chatId) => {
  const messages = await getItemsByIndex('messages', 'chatId', chatId)
  return messages.sort((a, b) => a.createdAt - b.createdAt)
}

export const getLastMessage = async (chatId) => {
  const messages = await getChatMessages(chatId)
  if (messages.length === 0) return null
  return messages[messages.length - 1]
}

// 聊天相关操作
export const createChat = (data) => createItem('chats', data)
export const getChatById = (id) => getItemById('chats', id)
export const updateChat = (id, data) => updateItem('chats', id, data)
export const deleteChat = (id) => deleteItem('chats', id)

export const addChatMemberRelation = (data) => createItem('chat_members', data)
export const getChatMemberRelations = (chatId) =>
  getItemsByIndex('chat_members', 'chatId', chatId)

export const getUserChats = async (userId) => {
  // 获取用户参与的所有聊天成员关系
  const userChatRelations = await getItemsByIndex(
    'chat_members',
    'memberId',
    userId,
  )
  if (!userChatRelations.length) return []

  // 提取所有聊天ID
  const chatIds = userChatRelations.map((relation) => relation.chatId)

  // 批量查询
  const results = await Promise.all([
    // 批量获取所有聊天详情
    Promise.all(chatIds.map((chatId) => getChatById(chatId))),
    // 批量获取所有聊天成员关系
    Promise.all(chatIds.map((chatId) => getChatMemberRelations(chatId))),
    // 批量获取所有聊天最后一条消息
    Promise.all(chatIds.map((chatId) => getLastMessage(chatId))),
  ])

  const [allChats, allChatMemberRelations, lastMessages] = results

  // 批量获取所有聊天成员的详细信息
  const allChatMembers = await Promise.all(
    await getChatMembersFromRelations(allChatMemberRelations),
  )

  // 组装数据
  const chats = allChats.map((chat, index) => {
    return {
      ...chat,
      members: allChatMembers[index],
      lastMessage: lastMessages[index],
    }
  })

  // 按最后消息时间排序
  const sortedChats = chats.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt || a.createdAt
    const timeB = b.lastMessage?.createdAt || b.createdAt
    return timeB - timeA
  })

  return sortedChats
}

export const getChatMembersFromRelations = async (chatMemberRelations) => {
  return Promise.all(
    chatMemberRelations.map(async (memberRelations) => {
      const memberDetails = await Promise.all(
        memberRelations.map(async (relation) => {
          return relation.memberType === 'ai'
            ? getCharacterById(relation.memberId)
            : getUserById(relation.memberId)
        }),
      )
      return memberDetails
    }),
  )
}

export const addMemberToChat = (data) => createItem('chat_members', data)

export const removeMemberFromChat = async (chatId, memberId) => {
  const relations = await getItemsByIndex('chat_members', 'chatId', chatId)
  const relation = relations.find((r) => r.memberId === memberId)
  if (relation) {
    return deleteItem('chat_members', relation.id)
  }
  return false
}

// 获取未在群组中的AI角色
export const getAvailableCharacters = async (chatId) => {
  const allCharacters = await getAllCharacters()
  const chatMembers = await getChatMemberRelations(chatId)
  const memberIds = chatMembers.map((m) => m.memberId)
  return allCharacters.filter((char) => !memberIds.includes(char.id))
}
