'use client'

import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'

type SortAlgorithm = 'bubble' | 'insertion' | 'selection'

export default function SortingVisualizer() {
    const [array, setArray] = useState<number[]>([])
    const [arraySize, setArraySize] = useState(30)
    const [isSorting, setIsSorting] = useState(false)
    const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble')
    const stopRef = useRef(false)

    const [elapsedTime, setElapsedTime] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const audioCtxRef = useRef<AudioContext | null>(null)
    useEffect(() => {
        audioCtxRef.current = new AudioContext()
        generateArray()
    }, [])

    const generateArray = () => {
        const newArr = Array.from({ length: arraySize }, () =>
            Math.floor(Math.random() * 100) + 1
        )
        setArray(newArr)
    }

    const playBeep = (value: number) => {
        const ctx = audioCtxRef.current
        if (!ctx) return

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.frequency.value = 100 + value * 5
        gain.gain.value = 0.1

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.05)
    }

    const bubbleSort = async (arr: number[]) => {
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (stopRef.current) return
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
                    playBeep(arr[j])
                    setArray([...arr])
                    await new Promise((r) => setTimeout(r, 50))
                }
            }
        }
    }

    const insertionSort = async (arr: number[]) => {
        for (let i = 1; i < arr.length; i++) {
            let key = arr[i]
            let j = i - 1

            while (j >= 0 && arr[j] > key) {
                if (stopRef.current) return
                arr[j + 1] = arr[j]
                j -= 1
                playBeep(arr[j + 1])
                setArray([...arr])
                await new Promise((r) => setTimeout(r, 50))
            }
            arr[j + 1] = key
            setArray([...arr])
        }
    }

    const selectionSort = async (arr: number[]) => {
        const n = arr.length
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i
            for (let j = i + 1; j < n; j++) {
                if (stopRef.current) return
                if (arr[j] < arr[minIdx]) minIdx = j
            }
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
                playBeep(arr[i])
                setArray([...arr])
                await new Promise((r) => setTimeout(r, 50))
            }
        }
    }

    const startSort = async () => {
        setIsSorting(true)
        stopRef.current = false
        setElapsedTime(0)

        // Start timer
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 10)
        }, 10)

        const arr = [...array]
        if (algorithm === 'bubble') await bubbleSort(arr)
        else if (algorithm === 'insertion') await insertionSort(arr)
        else if (algorithm === 'selection') await selectionSort(arr)

        stopTimer()
        setIsSorting(false)
    }

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const stopSort = () => {
        stopRef.current = true
        stopTimer()
        setIsSorting(false)
    }

    const resetArray = () => {
        stopSort()
        generateArray()
        setElapsedTime(0)
    }

    return (
        <>
            <Head>
                <title>Sorting Algorithms | Random Animations</title>
            </Head>
            <div
                style={{
                    background: '#000',
                    height: '100vh',
                    width: '100vw',
                    color: '#fff',
                    fontFamily: 'Arial, sans-serif',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                {/* Controls top-right */}
                <div
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        width: '150px',
                    }}
                >
                    <label style={{ fontSize: '0.75rem' }}>
                        Size: {arraySize}
                        <input
                            type="range"
                            min="10"
                            max="80"
                            value={arraySize}
                            onChange={(e) => {
                                setArraySize(Number(e.target.value))
                                generateArray()
                            }}
                            disabled={isSorting}
                            style={{ width: '100%' }}
                        />
                    </label>
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value as SortAlgorithm)}
                        disabled={isSorting}
                        style={{
                            padding: '4px',
                            fontSize: '0.8rem',
                            color: '#000',
                            backgroundColor: '#fff',
                        }}
                    >
                        <option value="bubble">Bubble Sort</option>
                        <option value="insertion">Insertion Sort</option>
                        <option value="selection">Selection Sort</option>
                    </select>

                    <button
                        onClick={startSort}
                        disabled={isSorting}
                        style={{
                            background: '#0f0',
                            color: '#000',
                            padding: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                        }}
                    >
                        Sort
                    </button>
                    <button
                        onClick={stopSort}
                        disabled={!isSorting}
                        style={{
                            background: '#f00',
                            color: '#fff',
                            padding: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                        }}
                    >
                        Stop
                    </button>
                    <button
                        onClick={resetArray}
                        disabled={isSorting}
                        style={{
                            background: '#00f',
                            color: '#fff',
                            padding: '5px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                        }}
                    >
                        Reset
                    </button>
                </div>

                {/* TOP BAR - Algorithm, Size, Timer */}
                <div
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    Algorithm: {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}<br />
                    Size: {arraySize}<br />
                    Time: {(elapsedTime / 1000).toFixed(2)}s
                </div>

                {/* Bar Chart */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '500px',
                        height: '60vh',
                        gap: '1px',
                    }}
                >
                    {array.map((val, i) => (
                        <div
                            key={i}
                            style={{
                                height: `${val * 0.6}%`,
                                width: `${100 / array.length}%`,
                                background: '#05fa09',
                                position: 'relative',
                                transition: 'height 0.1s linear',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -18,
                                    fontSize: '10px',
                                    color: 'white',
                                }}
                            >
                                {val}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
