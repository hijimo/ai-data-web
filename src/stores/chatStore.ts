/**
 * 聊天状态管理
 * 使用 Zustand 管理聊天会话、消息、用户输入等状态
 */

import { create } from 'zustand';
import type { Message } from '@/types/api/message';
import type { SessionResponse } from '@/types/api/sessionResponse';
import type { Assistant, ChatSettings, FileItem, MessageImage, Tool } from '@/types/chat';

/**
 * 聊天状态接口
 */
interface ChatState {
  /** 当前会话 */
  currentSession: SessionResponse | null;
  /** 消息列表 */
  messages: Message[];
  /** 用户输入 */
  userInput: string;
  /** 是否正在生成回复 */
  isGenerating: boolean;
  /** 聊天设置 */
  chatSettings: ChatSettings;
  /** 选中的助手 */
  selectedAssistant: Assistant | null;
  /** 选中的工具 */
  selectedTools: Tool[];
  /** 选中的文件 */
  selectedFiles: FileItem[];
  /** 选中的图片 */
  selectedImages: MessageImage[];
}

/**
 * 聊天操作接口
 */
interface ChatActions {
  /**
   * 设置当前会话
   * @param session 会话对象
   */
  setCurrentSession: (session: SessionResponse | null) => void;

  /**
   * 设置消息列表
   * @param messages 消息数组
   */
  setMessages: (messages: Message[]) => void;

  /**
   * 添加消息
   * @param message 消息对象
   */
  addMessage: (message: Message) => void;

  /**
   * 更新消息内容
   * @param id 消息 ID
   * @param content 新内容
   */
  updateMessage: (id: string, content: string) => void;

  /**
   * 删除消息
   * @param id 消息 ID
   */
  deleteMessage: (id: string) => void;

  /**
   * 设置用户输入
   * @param input 输入内容
   */
  setUserInput: (input: string) => void;

  /**
   * 设置生成状态
   * @param generating 是否正在生成
   */
  setIsGenerating: (generating: boolean) => void;

  /**
   * 更新聊天设置
   * @param settings 设置对象（部分更新）
   */
  updateChatSettings: (settings: Partial<ChatSettings>) => void;

  /**
   * 设置选中的助手
   * @param assistant 助手对象
   */
  setSelectedAssistant: (assistant: Assistant | null) => void;

  /**
   * 设置选中的工具
   * @param tools 工具数组
   */
  setSelectedTools: (tools: Tool[]) => void;

  /**
   * 设置选中的文件
   * @param files 文件数组
   */
  setSelectedFiles: (files: FileItem[]) => void;

  /**
   * 设置选中的图片
   * @param images 图片数组
   */
  setSelectedImages: (images: MessageImage[]) => void;

  /**
   * 重置聊天状态（切换会话时使用）
   */
  resetChatState: () => void;
}

/**
 * 聊天 Store 类型
 */
type ChatStore = ChatState & ChatActions;

/**
 * 初始状态
 */
const initialState: ChatState = {
  currentSession: null,
  messages: [],
  userInput: '',
  isGenerating: false,
  chatSettings: {
    model: 'gpt-4',
    temperature: 0.7,
    contextLength: 4096,
    systemPrompt: '',
    enableRetrieval: false,
    retrievalCount: 3,
  },
  selectedAssistant: null,
  selectedTools: [],
  selectedFiles: [],
  selectedImages: [],
};

/**
 * 聊天状态管理 Store
 *
 * 功能：
 * - 管理当前会话和消息列表
 * - 管理用户输入和生成状态
 * - 管理聊天设置（模型、温度等）
 * - 管理助手、工具、文件和图片选择
 */
export const useChatStore = create<ChatStore>()((set) => ({
  ...initialState,

  // 设置当前会话
  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  // 设置消息列表
  setMessages: (messages) => {
    set({ messages });
  },

  // 添加消息
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // 更新消息内容
  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
    }));
  },

  // 删除消息
  deleteMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  // 设置用户输入
  setUserInput: (input) => {
    set({ userInput: input });
  },

  // 设置生成状态
  setIsGenerating: (generating) => {
    set({ isGenerating: generating });
  },

  // 更新聊天设置
  updateChatSettings: (settings) => {
    set((state) => ({
      chatSettings: { ...state.chatSettings, ...settings },
    }));
  },

  // 设置选中的助手
  setSelectedAssistant: (assistant) => {
    set({ selectedAssistant: assistant });
  },

  // 设置选中的工具
  setSelectedTools: (tools) => {
    set({ selectedTools: tools });
  },

  // 设置选中的文件
  setSelectedFiles: (files) => {
    set({ selectedFiles: files });
  },

  // 设置选中的图片
  setSelectedImages: (images) => {
    set({ selectedImages: images });
  },

  // 重置聊天状态
  resetChatState: () => {
    set({
      messages: [],
      userInput: '',
      isGenerating: false,
      selectedFiles: [],
      selectedImages: [],
    });
  },
}));

/**
 * 选择器：获取当前会话
 */
export const selectCurrentSession = (state: ChatStore) => state.currentSession;

/**
 * 选择器：获取消息列表
 */
export const selectMessages = (state: ChatStore) => state.messages;

/**
 * 选择器：获取用户输入
 */
export const selectUserInput = (state: ChatStore) => state.userInput;

/**
 * 选择器：获取生成状态
 */
export const selectIsGenerating = (state: ChatStore) => state.isGenerating;

/**
 * 选择器：获取聊天设置
 */
export const selectChatSettings = (state: ChatStore) => state.chatSettings;

/**
 * 选择器：获取选中的助手
 */
export const selectSelectedAssistant = (state: ChatStore) => state.selectedAssistant;

/**
 * 选择器：获取选中的工具
 */
export const selectSelectedTools = (state: ChatStore) => state.selectedTools;

/**
 * 选择器：获取选中的文件
 */
export const selectSelectedFiles = (state: ChatStore) => state.selectedFiles;

/**
 * 选择器：获取选中的图片
 */
export const selectSelectedImages = (state: ChatStore) => state.selectedImages;
