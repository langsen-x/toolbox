import { reactive } from 'vue'
import { randomAccess } from '@utils'
import { SM4encCode } from '@utils/aesutil'
import md5 from 'js-md5'

export const useValid = () => {
  const qaList = [
    {
      q: '我的英文名是？',
      a: SM4encCode(md5('langsen')),
    },
    {
      q: '我最喜欢的动漫？',
      a: SM4encCode(md5('火影忍者naruto')),
    },
    {
      q: '我最喜欢的足球明星？',
      a: SM4encCode(md5('克里斯蒂亚诺罗纳尔多')),
    },
    {
      q: '我最喜欢的男演员？',
      a: SM4encCode(md5('周星驰（星星）')),
    },
    {
      q: '我最喜欢的女演员？',
      a: SM4encCode(md5('赵丽颖（小刀）')),
    },
    {
      q: '我从事的职业？',
      a: SM4encCode(md5('前端开发工程师')),
    },
  ]

  const qa = reactive({
    question: '',
    answer: '',
    curAnswer: '',
  })
  const randomQa = () => {
    const {
      q,
      a,
    } = qaList[randomAccess(0, qaList.length)]
    qa.question = q
    qa.answer = a
  }

  const validAnswer = (rAnswer, wAnswer) => {
    return rAnswer === SM4encCode(md5(wAnswer))
  }

  const closeValid = () => {
    qa.curAnswer = ''
  }

  return {
    qa,
    randomQa,
    closeValid,
    validAnswer,
  }
}
