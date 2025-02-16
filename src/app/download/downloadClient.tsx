'use client'

import { Button, Divider, List, message, Modal, Popover, Space } from "antd";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { config } from "../config";

interface IDownload {
    status: 'success' | 'failure' | 'queued';
    id?: string;
}

const ModalError = Modal.error
const messageSuccess = message.success
const ListItem = List.Item

export function DownloadClient() {
    const searchParams = useSearchParams()
    const id = searchParams?.get('id')

    const [detail, setDetail] = useState<IDownload>()

    const fetchDetail = async ()=>{
        const response = await fetch(`/api/pack?id=${id}`)
        if (!response.ok) {
            ModalError({
                title: '温馨提示',
                content: response.status === 404 ? '数据不存在' : '系统繁忙，请稍后再试！',
                okText: '知道了'
            })
            return
        }
        const data: IDownload = await response.json()
        if (data.status === 'success' || data.status === 'failure') {
            localStorage.setItem(`download_${id}`, JSON.stringify({ value: data }))
        }
        setDetail(data)
        return data
    }

    const loadData = async () => {
        if (!id) return
        const result = localStorage.getItem(`download_${id}`)
        if (result) {
            try {
                const { value } = JSON.parse(result)
                setDetail(value)
                return
            } catch (error) {
                console.log(`Error in parse localStorage download_${id}:`, error);
            }
        }
        const data = await fetchDetail()
        if(data?.status === 'queued'){
            // It takes about 5 minutes
            setTimeout(()=>{
                fetchDetail()
            },1000 * 60 * 5)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    if (!detail) {
        return null
    }

    const getTitle = () => {
        const { status } = detail
        if (status === 'success') {
            return '应用打包成功'
        }
        if (status === 'failure') {
            return '应用打包失败'
        }
        if (status === 'queued') {
            return '正在为您打包应用，大概需要5分钟！'
        }
    }

    const refreshed = async ()=>{
        await fetchDetail()
        messageSuccess('刷新成功')
    }

    return (
        <div className="w-full h-full" >
            <h1 className="pt-[105px] pb-7 text-[32px] text-center text-[#000]">{getTitle()}</h1>
            <div className="flex items-center justify-center mt-8" >
                {detail.status === 'success' && (
                    <Space>
                        <Button type='primary' href={`https://github.com/${config.github.owner}/${config.github.repo}/actions/runs/${detail.id}`} target='_blank' rel='noreferrer' >下载</Button>
                        <Popover content={<Image width={238} height={324} src='/author.jpg' alt="作者" />}>
                            <Button>webdesk 交流群</Button>
                        </Popover>
                    </Space>
                )
                }
                {
                    detail.status === 'failure' && (
                        <Space>
                            <Button type='primary' href={'/'} >重新打包</Button>
                            <Popover content={<Image width={238} height={324} src='/author.jpg' alt="作者" />}>
                                <Button>联系作者</Button>
                            </Popover>
                        </Space>
                    )
                }
                {
                    detail.status === 'queued' && (
                        <Space>
                            <Button type='primary' onClick={refreshed}  >刷新</Button>
                            <Popover content={<Image width={238} height={324} src='/author.jpg' alt="作者" />}>
                                <Button>webdesk 交流群</Button>
                            </Popover>
                        </Space>
                    )
                }
            </div>
            <div className="w-[600px] my-0 mx-auto">
                <Divider style={{ marginTop: 80 }} orientation='center'>
                    常见问题
                </Divider>
                <List
                    bordered
                    dataSource={[
                        {
                            title: 'mac无法打开app因为无法验证开发者',
                            link: 'https://cipa7o1s0xx.feishu.cn/wiki/RoUOwRYiHiJ8HNk2dBTcklqin6e'
                        },
                        {
                            title: 'window 安装时因为无法验证开发者，导致无法安装',
                            link: 'https://cipa7o1s0xx.feishu.cn/wiki/YQ3DwY572iIDiKkTYHxcX4qUnLG'
                        }
                    ]}
                    renderItem={(item, index) => (
                        <ListItem key={item.link} >
                            <a href={item.link} target='_blank' rel='noreferrer'>
                                <span>{index + 1}. </span>
                                {item.title}
                            </a>
                        </ListItem>
                    )}
                />
            </div>
        </div>
    )
}