import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { CommitStatus } from './struct';

export interface LineChartState {
    interval: string,
    developer: string,
}

const initialState: LineChartState = {
    interval: '',
    developer: '',
}

export const LineChartSlice = createSlice({
    name: 'lineChart',
    initialState,
    reducers: {
        setInterval: (state, action: PayloadAction<string>) => {
            state.interval = action.payload
        },
        setDeveloper: (state, action: PayloadAction<string>) => {
            state.developer = action.payload
        },
    }
})

const { actions, reducer } = LineChartSlice;

export const { setInterval, setDeveloper, } = actions

export default reducer