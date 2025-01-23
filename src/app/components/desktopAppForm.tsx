'use client'

import { Button, Form, Input, message, Modal, Radio, Upload, UploadProps } from 'antd'
import { useRef, useState } from 'react'
import { imageConversionBase64 } from '@/app/lib/image'
import { UploadOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { debounce } from '@/app/lib/utils'

const useForm = Form.useForm
const FormItem = Form.Item
const RadioGroup = Radio.Group
const ModalError = Modal.error

export const DeskTopAppForm = () => {

    const [loading, setLoading] = useState(false);
    const requestId = useRef(0)
    const onChangeWebsiteUrl = useRef<(() => void) | null>(null)
    const [form] = useForm()
    const router = useRouter()

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    /** 自动设置网站图标 */
    const autoSetWebsiteFavicon = async (websiteUrl: string) => {
        requestId.current++;
        const id = requestId.current;
        const response = await fetch('/api/favicon', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: websiteUrl }) })
        if (!response.ok || id !== requestId.current) {
            return
        }
        const { data }: { data: string } = await response.json()
        form.setFieldValue('logo', [
            {
                name: 'logo.png',
                status: 'done',
                uid: `${Date.now()}`,
                url: data,
                thumbUrl: data,
                response: data,
                auto: true
            }
        ]);
    };
    if (!onChangeWebsiteUrl.current) {
        onChangeWebsiteUrl.current = debounce(() => {
            const url = form.getFieldValue('url');
            const logoUrl = form.getFieldValue('logo');
            const [logo] = logoUrl || [];
            if (url && url.startsWith('http') && !logo?.auto) {
                autoSetWebsiteFavicon(url);
            }
        }, 1000)
    }

    const onFinish = async (values: { name: string, url: string, logo: any[], mail?: string, os: 'win' | 'mac' }) => {
        setLoading(true)
        try {
            const { logo, ...params } = values
            const icon = logo[0].auto ? logo[0].response : await imageConversionBase64(logo[0].originFileObj)
            const response = await fetch('/api/pack', {
                method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
                    ...params, logo: icon
                })
            })
            if (!response.ok) {
                ModalError({
                    title: '温馨提示',
                    content: '系统繁忙，请稍后再试！',
                    okText: '知道了'
                })
                return;
            }
            const { id } = await response.json()
            router.push(`/download?id=${id}`)
        } finally {
            setLoading(false)
        }
    }

    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        try {
            if (file.size / 1024 > 40) {
                message.error('图标大小不能超过40kb，请重新上传！');
                return Upload.LIST_IGNORE;
            }
            return file
        } catch (err) {
            message.error('图标转换失败，请重新上传！');
            return Upload.LIST_IGNORE;
        }
    };

    return (
        <>
            <Form form={form} onFinish={onFinish} size='large' className="desktop-app-form w-[620px] !my-0 !mx-auto !p-5 rounded-lg" style={{ boxShadow: '0 2px 24px rgba(0, 0, 0, 0.1)' }} layout='vertical'>
                <FormItem
                    name='url'
                    label='请输入您的网站地址'
                    required
                    rules={[{ required: true, message: '请输入您的网站地址', whitespace: true }]}
                >
                    <Input placeholder='请输入您的网站地址' onChange={onChangeWebsiteUrl.current} />
                </FormItem>
                <FormItem
                    name='name'
                    label='应用程序名称'
                    required
                    rules={[{ required: true, message: '请输入应用程序名称', whitespace: true }]}
                >
                    <Input placeholder='请输入应用程序名称' />
                </FormItem>
                <FormItem
                    name='logo'
                    label='应用程序图标'
                    valuePropName='fileList'
                    required
                    rules={[
                        {
                            validator: (rule, value) => {
                                const status = (value || []).some(
                                    (file: any) => file.status === 'done' && file.response
                                );

                                if (status) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('请上传应用程序图标');
                            }
                        }
                    ]}
                    getValueFromEvent={normFile}
                    tooltip='图标大小不能超过40kb，尺寸512x512'
                >
                    <Upload
                        accept='image/*'
                        name='logo'
                        maxCount={1}
                        beforeUpload={beforeUpload}
                        listType='picture'
                    >
                        <Button icon={<UploadOutlined />}>上传图标</Button>
                    </Upload>
                </FormItem>
                <FormItem
                    name='os'
                    label='选择平台'
                    required
                    rules={[{ required: true, message: '请选择平台', whitespace: true }]}
                >
                    <RadioGroup>
                        <Radio value={'win'}>window</Radio>
                        <Radio value={'mac'}>macOS</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem>
                    <Button loading={loading} type='primary' block size='large' htmlType='submit'>
                        <span>创建桌面应用程序</span>
                    </Button>
                </FormItem>
            </Form>
        </>
    )
}