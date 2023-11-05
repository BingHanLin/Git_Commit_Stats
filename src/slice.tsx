import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface LineChartState {
    interval: string,
    developer: string,
    date_range: [number | null, number | null],
}

const initialState: LineChartState = {
    interval: '',
    developer: '',
    date_range: [null, null]
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
        setDateRange: (state, action: PayloadAction<[number | null, number | null]>) => {
            state.date_range = action.payload
        },
    },
})

const { actions, reducer } = LineChartSlice;

export const { setInterval, setDeveloper, setDateRange } = actions

export default reducer