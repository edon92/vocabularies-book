import React, { useState, useRef, useEffect } from 'react'
// import Tooltip from 'rc-tooltip'
import { Dialog } from 'src/components/dialog'
import './list-item.less'
import { useKeySoudIns } from 'src/hooks/useSounds'
import { playWordPronunciation } from 'src/utils'
import { useDispatch } from 'react-redux'
import { fetchWordList } from 'src/store/word'
import axios from 'axios'

export default function Card({
  word,
  showFirstWordTranslate
}: CardProps) {
  const dispatch = useDispatch()

  const [showTranslate, setShowTranslate] = useState(false)
  const [sentence, setSentence] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { playKeySound, playBeepSound, playSuccessSound } = useKeySoudIns
  const [translateEditable, setTranslateEditable] = useState(false)

  useEffect(() => {
    ;(window as any).playBeepSound = playBeepSound
    ;(window as any).playKeySound = playKeySound
    ;(window as any).playSuccessSound = playSuccessSound
  }, [])

  useEffect(() => {
    setShowTranslate(!!showFirstWordTranslate)
  }, [showFirstWordTranslate])

  useEffect(() => {
    if (showTranslate && !sentence) {
      getEgSentence(word?.text!)
    }
  }, [showTranslate])

  const hanleShowTranslate = () => {
    setShowTranslate((showTranslate) => !showTranslate)
  }

  const handleAudioPlay = () => {
    playWordPronunciation(word!.text)
  }

  const handleDelete = async () => {
    console.log('删除')
    await window.services.wordModel.deleteWrodObj(word!.text)
    playBeepSound()
    dispatch(fetchWordList())
    setShowDeleteDialog(false)
  }

  const handleLevelUp = (text = '') => {
    console.log('升级')
    playSuccessSound()
    window.services.wordModel.addWordToNextLevel(text)
    dispatch(fetchWordList())
  }

  const handleback = (text = '') => {
    console.log('降级')
    playBeepSound()
    window.services.wordModel.addWordToPreviousLevel(text)
    dispatch(fetchWordList())
  }

  const showDeleteModal = () => {
    setShowDeleteDialog(true)
  }


  const getEgSentence = async (text: string) => {
    const url = `https://apii.dict.cn/mini.php?q=${text}`
    const res = await axios(url)
    const html = res.data
    const title = html.match(/<div class="t">((?!<\/div)(.|\n))+<\/div>/) || {}
    const sentence = html.match(/<div id="s">((?!<\/div)(.|\n))+<\/div>/) || {}
    if (title[0] && sentence[0]) {
      let totalHtml = `${title[0]}${sentence[0]}`
      setSentence(totalHtml)
    }
  }

  return (
    <div className="list-item">
      {showDeleteDialog && (
        <Dialog
          visible={showDeleteDialog}
          onOk={() => handleDelete()}
          onCancel={() => setShowDeleteDialog(false)}
        ></Dialog>
      )}
      <p className="word">
        {word?.text}
        <span className="phonetic">
          {word?.phonetic ? `[${word?.phonetic}]` : ''}
        </span>
      </p>
      {/* <Tooltip overlay={`遗忘曲线等级: ${(word?.learn.level as number) + 1}`} overlayStyle={{ transform: 'scale(.8)' }} placement="top"> */}
      <div className="level">
        <i
          className={`iconfont icon-level-${(word?.learn.level as number) + 1}`}
        ></i>
        {/* &nbsp;{word?.learn.level} */}
      </div>
      {/* </Tooltip> */}
      {/* <div className="time">
        <i className="iconfont icon-time"></i>&nbsp;{dayjs(word?.learn.learnDate).format('YYYY-MM-DD hh:mm:ss')}
      </div> */}
      <div className="operate">
        <div>
          {/* <Tooltip overlay="播放" overlayStyle={{ transform: 'scale(.8)' }}> */}
          <i
            className="iconfont icon-player iconHover"
            onClick={handleAudioPlay}
          ></i>
          {/* </Tooltip> */}
          {/* <Tooltip
            placement="left"
            overlay="显示/隐藏 翻译"
            overlayStyle={{ transform: 'scale(.8)' }}
          > */}
          <i
            className="iconfont icon-translate iconHover"
            onClick={hanleShowTranslate}
          ></i>
          {/* </Tooltip> */}
        </div>
        <div>
          {/* <Tooltip
            placement="left"
            overlay="记得"
            overlayStyle={{ transform: 'scale(.8)' }}
          > */}
          <i
            className="iconfont icon-check iconHover"
            onClick={() => handleLevelUp(word?.text)}
          ></i>
          {/* </Tooltip>
          <Tooltip
            placement="left"
            overlay="忘记"
            overlayStyle={{ transform: 'scale(.8)' }}
          > */}
          <i
            className="iconfont icon-close iconHover"
            onClick={() => handleback(word!.text)}
          ></i>
          {/* </Tooltip> */}
          {/* <Tooltip
            placement="left"
            overlay="删除"
            overlayStyle={{ transform: 'scale(.8)' }}
          > */}
          <i
            className="iconfont icon-delete iconHover"
            onClick={showDeleteModal}
          ></i>
          {/* </Tooltip> */}
        </div>
      </div>
      {showTranslate && (
        <div className="translation">
          {word?.explains?.map((text) => (
            <div key={text}>{text}</div>
          ))}
        <div dangerouslySetInnerHTML={{__html: sentence}}></div>
          {/* {translateEditable ? (
            <i
              className="iconfont icon-check iconHover"
              onClick={() => {
                setTranslateEditable(false)
              }}
            />
          ) : (
            <i
              className="iconfont icon-edit iconHover"
              onClick={() => {
                setTranslateEditable(true)
              }}
            />
          )} */}
        </div>
      )}
    </div>
  )
}
