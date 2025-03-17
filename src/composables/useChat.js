import { ref } from 'vue'
import { useAuth } from './useAuth'
import {
  getUserChats,
  createChat,
  addChatMemberRelation,
  getChatMessages,
  createMessage,
  createCharacter,
  getChatMembersFromRelations,
} from '@/services/repositories'

const { currentUser } = useAuth()

const chats = ref([])
const chatMessages = ref({})
const loading = ref(true)

// 初始化数据
const initData = async () => {
  try {
    if (!currentUser.value) return

    const userChats = await getUserChats(currentUser.value.id)

    chats.value = userChats
    // console.log('chats', chats.value)
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建AI角色
const createAICharacter = async (characterData) => {
  try {
    // 保存AI角色
    const character = {
      name: characterData.name,
      gender: characterData.gender,
      personality: characterData.personality,
      background: characterData.background,
      description: characterData.description,
      createdBy: currentUser.value.id,
    }
    const savedCharacter = await createCharacter(character)

    // 创建聊天
    const chat = {
      type: 'single',
      name: character.name,
      createdBy: currentUser.value.id,
    }
    const savedChat = await createChat(chat)

    // 添加聊天成员
    const userMemberRelation = await addChatMemberRelation({
      chatId: savedChat.id,
      memberId: currentUser.value.id,
      memberType: 'user',
    })

    const characterMemberRelation = await addChatMemberRelation({
      chatId: savedChat.id,
      memberId: savedCharacter.id,
      memberType: 'ai',
    })

    const members = await getChatMembersFromRelations([
      [userMemberRelation, characterMemberRelation],
    ])

    // 更新缓存
    chats.value.unshift({
      ...savedChat,
      members: members,
      lastMessage: null,
    })
    chatMessages.value[savedChat.id] = []

    return savedChat.id
  } catch (error) {
    console.error('创建AI角色失败:', error)
    throw error
  }
}

// 创建群聊
const createGroup = async (group) => {
  try {
    // 创建聊天
    const chat = {
      type: 'group',
      name: group.name,
      createdBy: currentUser.value.id,
    }
    const savedChat = await createChat(chat)

    // 添加成员
    const memberRelations = []
    const userMemberRelations = await addChatMemberRelation({
      chatId: savedChat.id,
      memberId: currentUser.value.id,
      memberType: 'user',
    })

    memberRelations.push(userMemberRelations)

    // 添加AI角色
    for (const characterId of group.aiMemberIds) {
      const aiMemberRelations = await addChatMemberRelation({
        chatId: savedChat.id,
        memberId: characterId,
        memberType: 'ai',
      })

      memberRelations.push(aiMemberRelations)
    }

    const members = await getChatMembersFromRelations([memberRelations])

    // 更新缓存
    chats.value.unshift({
      ...savedChat,
      members: members[0],
      lastMessage: null,
    })
    chatMessages.value[savedChat.id] = []

    return savedChat.id
  } catch (error) {
    console.error('创建群聊失败:', error)
    throw error
  }
}

// 加载聊天记录
const loadMessages = async (chatId) => {
  try {
    const messages = await getChatMessages(chatId)
    chatMessages.value[chatId] = messages
    return messages
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    throw error
  }
}

// 发送消息
const sendMessage = async (chatId, content) => {
  try {
    // 保存用户消息
    const userMessage = await createMessage({
      chatId,
      content,
      createdBy: currentUser.value.id,
    })

    // 更新缓存
    if (!chatMessages.value[chatId]) {
      chatMessages.value[chatId] = []
    }
    chatMessages.value[chatId].push(userMessage)

    // 获取聊天信息
    const chat = chats.value.find((c) => c.id === chatId)

    const aiMembers = chat.members
      .filter((member) => member.id !== currentUser.value.id)
      .map((member) => member)

    // 为每个AI角色获取回复
    for (const character of aiMembers) {
      // 构建聊天历史
      const recentMessages = chatMessages.value[chatId].slice(-20) // 只取最近20条消息
      const chatHistory = recentMessages.map((msg) => ({
        role: msg.createdBy === currentUser.value.id ? 'user' : 'assistant',
        content: msg.content,
      }))

      // 构建系统提示词
      const systemPrompt = `从现在开始，你要扮演一个名叫${character.name}的${character.gender}生与用户进行交流，你的性格${character.personality}，
        背景是${character.background}。${character.description}。要求表达口语化，符合社交媒体的语言特性和习惯。`

      // 添加系统提示词
      chatHistory.unshift({ role: 'system', content: systemPrompt })

      // 调用API获取回复
      const reply = await getAIResponse(chatHistory)

      // 保存AI回复
      const aiMessage = await createMessage({
        chatId,
        content: reply,
        createdBy: character.id,
      })

      // 更新缓存
      chatMessages.value[chatId].push(aiMessage)

      // 更新最后一条消息
      const chatIndex = chats.value.findIndex((c) => c.id === chatId)
      if (chatIndex > -1) {
        chats.value[chatIndex].lastMessage = aiMessage
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    throw error
  }
}

// 获取AI回复
const getAIResponse = async (messages) => {
  const API_URL = import.meta.env.VITE_DEEPSEEK_API_URL
  const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('获取AI回复失败:', error)
    throw new Error('获取AI回复失败')
  }
}

// 显示群聊菜单
const showGroupMembers = ref(false)

export const useChat = () => {
  return {
    chats,
    chatMessages,
    loading,
    showGroupMembers,
    initData,
    createAICharacter,
    createGroup,
    loadMessages,
    sendMessage,
  }
}
