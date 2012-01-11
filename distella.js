/*
distella.js, a javascript Atari 2600 rom disassembler, based on DiStella.

Copyright (C) 2011 Daniel Presser (daniel dot presser at gmail dot com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

Array.prototype.copyToArray = function (fromOffset, fromCount, destOffset, dest) {
    for (var i = 0; i < fromCount; i++)
        dest[destOffset + i] = this[fromOffset + i];
}

function distella(params, img) {
    var dist = this;

    dist.app_data = {
        start: 0x0,
        load: 0x0000,
        length: 0,
        end: 0x0FFF,
        disp_data: 0
    };

    dist.consts = {
        stella: [
            "VSYNC",
            "VBLANK",
            "WSYNC",
            "RSYNC",
            "NUSIZ0",
            "NUSIZ1",
            "COLUP0",
            "COLUP1",
            "COLUPF",
            "COLUBK",
            "CTRLPF",
            "REFP0",
            "REFP1",
            "PF0",
            "PF1",
            "PF2",
            "RESP0",
            "RESP1",
            "RESM0",
            "RESM1",
            "RESBL",
            "AUDC0",
            "AUDC1",
            "AUDF0",
            "AUDF1",
            "AUDV0",
            "AUDV1",
            "GRP0",
            "GRP1",
            "ENAM0",
            "ENAM1",
            "ENABL",
            "HMP0",
            "HMP1",
            "HMM0",
            "HMM1",
            "HMBL",
            "VDELP0",
            "VDELP1",
            "VDELBL",
            "RESMP0",
            "RESMP1",
            "HMOVE",
            "HMCLR",
            "CXCLR",
            "$2D",
            "$2E",
            "$2F",
            "CXM0P",
            "CXM1P",
            "CXP0FB",
            "CXP1FB",
            "CXM0FB",
            "CXM1FB",
            "CXBLPF",
            "CXPPMM",
            "INPT0",
            "INPT1",
            "INPT2",
            "INPT3",
            "INPT4",
            "INPT5"],
        ioregs: [
            "SWCHA",
            "SWACNT",
            "SWCHB",
            "SWBCNT",
            "INTIM",
            "$0285",
            "$0286",
            "$0287",
            "$0288",
            "$0289",
            "$028A",
            "$028B",
            "$028C",
            "$028D",
            "$028E",
            "$028F",
            "$0290",
            "$0291",
            "$0292",
            "$0293",
            "TIM1T",
            "TIM8T",
            "TIM64T",
            "T1024T"],
        maria: [
            "$00",
            "INPTCTRL",
            "$02",
            "$03",
            "$04",
            "$05",
            "$06",
            "$07",
            "INPT0",
            "INPT1",
            "INPT2",
            "INPT3",
            "INPT4",
            "INPT5",
            "$0E",
            "$0F",
            "$10",
            "$11",
            "$12",
            "$13",
            "$14",
            "AUDC0",
            "AUDC1",
            "AUDF0",
            "AUDF1",
            "AUDV0",
            "AUDV1",
            "$1B",
            "$1C",
            "$1D",
            "$1E",
            "$1F",
            "BACKGRND",
            "P0C1",
            "P0C2",
            "P0C3",
            "WSYNC",
            "P1C1",
            "P1C2",
            "P1C3",
            "MSTAT",
            "P2C1",
            "P2C2",
            "P2C3",
            "DPPH",
            "P3C1",
            "P3C2",
            "P3C3",
            "DPPL",
            "P4C1",
            "P4C2",
            "P4C3",
            "CHBASE",
            "P5C1",
            "P5C2",
            "P5C3",
            "OFFSET",
            "P6C1",
            "P6C2",
            "P6C3",
            "CTRL",
            "P7C1",
            "P7C2",
            "P7C3"],
        mariaio: [
            "SWCHA",
            "SWACNT",
            "SWCHB",
            "SWBCNT"],
        pokey: [
            "AUDF2",
            "AUDC2",
            "AUDF3",
            "AUDC3",
            "AUDF4",
            "AUDC4",
            "AUDF5",
            "AUDC5",
            "AUDCTL",
            "$4009",
            "RANDOM",
            "$400B",
            "$400C",
            "$400D",
            "$400E",
            "SKCTLS"],
        NO_HEADER: 0,
        YES_HEADER: 1,
        M_NONE: 0,
        M_AC: 1,
        M_XR: 2,
        M_YR: 3,
        M_SP: 4,
        M_SR: 5,
        M_PC: 6,
        M_IMM: 7,
        M_ZERO: 8,
        M_ZERX: 9,
        M_ZERY: 10,
        M_ABS: 11,
        M_ABSX: 12,
        M_ABSY: 13,
        M_AIND: 14,
        M_INDX: 15,
        M_INDY: 16,
        M_REL: 17,
        M_FC: 18,
        M_FD: 19,
        M_FI: 20,
        M_FV: 21,
        M_ADDR: 22,
        M_: 23,
        M_ACIM: 24, // source: AC & IMMED (bus collision) 
        M_ANXR: 25, // source: AC & XR (bus collision) 
        M_AXIM: 26, // source: (AC | #EE) & XR & IMMED (bus collision) 
        M_ACNC: 27, // Dest: M_AC and Carry = Negative 
        M_ACXR: 28, // Dest: M_AC, M_XR 
        M_SABY: 29, // source: (ABS_Y & SP) (bus collision) 
        M_ACXS: 30, // Dest: M_AC, M_XR, M_SP 
        M_STH0: 31, // Dest: Store (src & Addr_Hi+1) to (Addr +0x100) 
        M_STH1: 32,
        M_STH2: 33,
        M_STH3: 34,
        IMPLIED: 0,
        ACCUMULATOR: 1,
        IMMEDIATE: 2,
        ZERO_PAGE: 3,
        ZERO_PAGE_X: 4,
        ZERO_PAGE_Y: 5,
        ABSOLUTE: 6,
        ABSOLUTE_X: 7,
        ABSOLUTE_Y: 8,
        ABS_INDIRECT: 9,
        INDIRECT_X: 10,
        INDIRECT_Y: 11,
        RELATIVE: 12,
        ASS_CODE: 13,
        REFERENCED: 1, /* code somewhere in the program references it, i.e. LDA $F372 referenced $F372 */
        VALID_ENTRY: 2, /* addresses that can have a label placed in front of it. A good counterexample  would be "FF00: LDA $FE00"; $FF01 would be in the middle of a multi-byte instruction, and therefore cannot be labelled. */
        DATA: 4,
        GFX: 8,
        REACHABLE: 16, /* disassemble-able code segments */
        NO_HEADER: 0, /* Boolean definitions for Atari 7800 header presence */
        YES_HEADER: 1
    };

    dist.lookup = [
            { mnemonic: "BRK", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_PC, cycles: 7, pbc_fix: 0 },              // 00 Pseudo Absolute        
            {mnemonic: "ORA", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // 01 (Indirect,X)
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 02 TILT
            {mnemonic: ".SLO", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // 03

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },        // 04
            {mnemonic: "ORA", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // 05 Zeropage
            {mnemonic: "ASL", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // 06 Zeropage
            {mnemonic: ".SLO", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // 07

            {mnemonic: "PHP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_SR, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },              // 08
            {mnemonic: "ORA", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // 09 Immediate
            {mnemonic: "ASL", addr_mode: dist.consts.ACCUMULATOR, source: dist.consts.M_AC, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },            // 0a Accumulator
            {mnemonic: ".ANC", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_ACIM, destination: dist.consts.M_ACNC, cycles: 2, pbc_fix: 0 },         // 0b

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },         // 0c
            {mnemonic: "ORA", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // 0d Absolute
            {mnemonic: "ASL", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // 0e Absolute
            {mnemonic: ".SLO", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // 0f

            {mnemonic: "BPL", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // 10
            {mnemonic: "ORA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // 11 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 12 TILT
            {mnemonic: ".SLO", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // 13

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // 14
            {mnemonic: "ORA", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // 15 Zeropage,X
            {mnemonic: "ASL", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // 16 Zeropage,X
            {mnemonic: ".SLO", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // 17

            {mnemonic: "CLC", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FC, cycles: 2, pbc_fix: 0 },              // 18
            {mnemonic: "ORA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 19 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // 1a
            {mnemonic: ".SLO", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // 1b

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // 1c
            {mnemonic: "ORA", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 1d Absolute,X
            {mnemonic: "ASL", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // 1e Absolute,X
            {mnemonic: ".SLO", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },        // 1f

            {mnemonic: "JSR", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ADDR, destination: dist.consts.M_PC, cycles: 6, pbc_fix: 0 },             // 20
            {mnemonic: "AND", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // 21 (Indirect ,X)
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 22 TILT
            {mnemonic: ".RLA", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // 23

            {mnemonic: "BIT", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },          // 24 Zeropage
            {mnemonic: "AND", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // 25 Zeropage
            {mnemonic: "ROL", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // 26 Zeropage
            {mnemonic: ".RLA", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // 27

            {mnemonic: "PLP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_SR, cycles: 4, pbc_fix: 0 },              // 28
            {mnemonic: "AND", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // 29 Immediate
            {mnemonic: "ROL", addr_mode: dist.consts.ACCUMULATOR, source: dist.consts.M_AC, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },            // 2a Accumulator
            {mnemonic: ".ANC", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_ACIM, destination: dist.consts.M_ACNC, cycles: 2, pbc_fix: 0 },         // 2b

            {mnemonic: "BIT", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },            // 2c Absolute
            {mnemonic: "AND", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // 2d Absolute
            {mnemonic: "ROL", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // 2e Absolute
            {mnemonic: ".RLA", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // 2f

            {mnemonic: "BMI", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // 30
            {mnemonic: "AND", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // 31 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 32 TILT
            {mnemonic: ".RLA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // 33

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // 34
            {mnemonic: "AND", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // 35 Zeropage,X
            {mnemonic: "ROL", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // 36 Zeropage,X
            {mnemonic: ".RLA", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // 37

            {mnemonic: "SEC", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FC, cycles: 2, pbc_fix: 0 },              // 38
            {mnemonic: "AND", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 39 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // 3a
            {mnemonic: ".RLA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // 3b

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // 3c
            {mnemonic: "AND", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 3d Absolute,X
            {mnemonic: "ROL", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // 3e Absolute,X
            {mnemonic: ".RLA", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },        // 3f

            {mnemonic: "RTI", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_PC, cycles: 6, pbc_fix: 0 },              // 40
            {mnemonic: "EOR", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // 41 (Indirect,X)
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 42 TILT
            {mnemonic: ".SRE", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // 43

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },        // 44
            {mnemonic: "EOR", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // 45 Zeropage
            {mnemonic: "LSR", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // 46 Zeropage
            {mnemonic: ".SRE", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // 47

            {mnemonic: "PHA", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_AC, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },              // 48
            {mnemonic: "EOR", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // 49 Immediate
            {mnemonic: "LSR", addr_mode: dist.consts.ACCUMULATOR, source: dist.consts.M_AC, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },            // 4a Accumulator
            {mnemonic: ".ASR", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_ACIM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },           // 4b (AC & IMM) >>1

            {mnemonic: "JMP", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ADDR, destination: dist.consts.M_PC, cycles: 3, pbc_fix: 0 },             // 4c Absolute
            {mnemonic: "EOR", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // 4d Absolute
            {mnemonic: "LSR", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // 4e Absolute
            {mnemonic: ".SRE", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // 4f

            {mnemonic: "BVC", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // 50
            {mnemonic: "EOR", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // 51 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 52 TILT
            {mnemonic: ".SRE", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // 53

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // 54
            {mnemonic: "EOR", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // 55 Zeropage,X
            {mnemonic: "LSR", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // 56 Zeropage,X
            {mnemonic: ".SRE", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // 57

            {mnemonic: "CLI", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FI, cycles: 2, pbc_fix: 0 },              // 58
            {mnemonic: "EOR", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 59 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // 5a
            {mnemonic: ".SRE", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // 5b

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // 5c
            {mnemonic: "EOR", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 5d Absolute,X
            {mnemonic: "LSR", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // 5e Absolute,X
            {mnemonic: ".SRE", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },        // 5f

            {mnemonic: "RTS", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_PC, cycles: 6, pbc_fix: 0 },              // 60
            {mnemonic: "ADC", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // 61 (Indirect,X)
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 62 TILT
            {mnemonic: ".RRA", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // 63

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },        // 64
            {mnemonic: "ADC", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // 65 Zeropage
            {mnemonic: "ROR", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // 66 Zeropage
            {mnemonic: ".RRA", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // 67

            {mnemonic: "PLA", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // 68
            {mnemonic: "ADC", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // 69 Immediate
            {mnemonic: "ROR", addr_mode: dist.consts.ACCUMULATOR, source: dist.consts.M_AC, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },            // 6a Accumulator
            {mnemonic: ".ARR", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_ACIM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },           // 6b ARR isn't typo

            {mnemonic: "JMP", addr_mode: dist.consts.ABS_INDIRECT, source: dist.consts.M_AIND, destination: dist.consts.M_PC, cycles: 5, pbc_fix: 0 },         // 6c Indirect
            {mnemonic: "ADC", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // 6d Absolute
            {mnemonic: "ROR", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // 6e Absolute
            {mnemonic: ".RRA", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // 6f

            {mnemonic: "BVS", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // 70
            {mnemonic: "ADC", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // 71 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 72 TILT relative?
            {mnemonic: ".RRA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // 73

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // 74
            {mnemonic: "ADC", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // 75 Zeropage,X
            {mnemonic: "ROR", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // 76 Zeropage,X
            {mnemonic: ".RRA", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // 77

            {mnemonic: "SEI", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FI, cycles: 2, pbc_fix: 0 },              // 78
            {mnemonic: "ADC", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 79 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // 7a
            {mnemonic: ".RRA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // 7b

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // 7c
            {mnemonic: "ADC", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // 7d Absolute,X
            {mnemonic: "ROR", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // 7e Absolute,X
            {mnemonic: ".RRA", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },        // 7f

    //***Negative***                              

            {mnemonic: ".NOOP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },        // 80
            {mnemonic: "STA", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_AC, destination: dist.consts.M_INDX, cycles: 6, pbc_fix: 0 },           // 81 (Indirect,X)
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },        // 82
            {mnemonic: ".SAX", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_ANXR, destination: dist.consts.M_INDX, cycles: 6, pbc_fix: 0 },        // 83

            {mnemonic: "STY", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_YR, destination: dist.consts.M_ZERO, cycles: 3, pbc_fix: 0 },            // 84 Zeropage
            {mnemonic: "STA", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_AC, destination: dist.consts.M_ZERO, cycles: 3, pbc_fix: 0 },            // 85 Zeropage
            {mnemonic: "STX", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_XR, destination: dist.consts.M_ZERO, cycles: 3, pbc_fix: 0 },            // 86 Zeropage
            {mnemonic: ".SAX", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ANXR, destination: dist.consts.M_ZERO, cycles: 3, pbc_fix: 0 },         // 87

            {mnemonic: "DEY", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_YR, destination: dist.consts.M_YR, cycles: 2, pbc_fix: 0 },                // 88
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },        // 89
            {mnemonic: "TXA", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_XR, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },                // 8a
            {mnemonic: ".ANE", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_AXIM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },           // 8b

            {mnemonic: "STY", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_YR, destination: dist.consts.M_ABS, cycles: 4, pbc_fix: 0 },              // 8c Absolute
            {mnemonic: "STA", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_AC, destination: dist.consts.M_ABS, cycles: 4, pbc_fix: 0 },              // 8d Absolute
            {mnemonic: "STX", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_XR, destination: dist.consts.M_ABS, cycles: 4, pbc_fix: 0 },              // 8e Absolute
            {mnemonic: ".SAX", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ANXR, destination: dist.consts.M_ABS, cycles: 4, pbc_fix: 0 },           // 8f

            {mnemonic: "BCC", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // 90
            {mnemonic: "STA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_AC, destination: dist.consts.M_INDY, cycles: 6, pbc_fix: 0 },           // 91 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // 92 TILT relative?
            {mnemonic: ".SHA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_ANXR, destination: dist.consts.M_STH0, cycles: 6, pbc_fix: 0 },        // 93

            {mnemonic: "STY", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_YR, destination: dist.consts.M_ZERX, cycles: 4, pbc_fix: 0 },          // 94 Zeropage,X
            {mnemonic: "STA", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_AC, destination: dist.consts.M_ZERX, cycles: 4, pbc_fix: 0 },          // 95 Zeropage,X
            {mnemonic: "STX", addr_mode: dist.consts.ZERO_PAGE_Y, source: dist.consts.M_XR, destination: dist.consts.M_ZERY, cycles: 4, pbc_fix: 0 },          // 96 Zeropage,Y
            {mnemonic: ".SAX", addr_mode: dist.consts.ZERO_PAGE_Y, source: dist.consts.M_ANXR, destination: dist.consts.M_ZERY, cycles: 4, pbc_fix: 0 },       // 97

            {mnemonic: "TYA", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_YR, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },                // 98
            {mnemonic: "STA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_AC, destination: dist.consts.M_ABSY, cycles: 5, pbc_fix: 0 },           // 99 Absolute,Y
            {mnemonic: "TXS", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_XR, destination: dist.consts.M_SP, cycles: 2, pbc_fix: 0 },                // 9a
            {mnemonic: ".SHS", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ANXR, destination: dist.consts.M_STH3, cycles: 5, pbc_fix: 0 },        // 9b

            {mnemonic: ".SHY", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_YR, destination: dist.consts.M_STH2, cycles: 5, pbc_fix: 0 },          // 9c
            {mnemonic: "STA", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_AC, destination: dist.consts.M_ABSX, cycles: 5, pbc_fix: 0 },           // 9d Absolute,X
            {mnemonic: ".SHX", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_XR, destination: dist.consts.M_STH1, cycles: 5, pbc_fix: 0 },          // 9e
            {mnemonic: ".SHA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ANXR, destination: dist.consts.M_STH1, cycles: 5, pbc_fix: 0 },        // 9f

            {mnemonic: "LDY", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_YR, cycles: 2, pbc_fix: 0 },             // a0 Immediate
            {mnemonic: "LDA", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // a1 (indirect,X)
            {mnemonic: "LDX", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },             // a2 Immediate
            {mnemonic: ".LAX", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_ACXR, cycles: 6, pbc_fix: 0 },        // a3 (indirect,X)

            {mnemonic: "LDY", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_YR, cycles: 3, pbc_fix: 0 },            // a4 Zeropage
            {mnemonic: "LDA", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // a5 Zeropage
            {mnemonic: "LDX", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_XR, cycles: 3, pbc_fix: 0 },            // a6 Zeropage
            {mnemonic: ".LAX", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ACXR, cycles: 3, pbc_fix: 0 },         // a7

            {mnemonic: "TAY", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_AC, destination: dist.consts.M_YR, cycles: 2, pbc_fix: 0 },                // a8
            {mnemonic: "LDA", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // a9 Immediate
            {mnemonic: "TAX", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_AC, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },                // aa
            {mnemonic: ".LXA", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_ACIM, destination: dist.consts.M_ACXR, cycles: 2, pbc_fix: 0 },         // ab LXA isn't a typo

            {mnemonic: "LDY", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_YR, cycles: 4, pbc_fix: 0 },              // ac Absolute
            {mnemonic: "LDA", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // ad Absolute
            {mnemonic: "LDX", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_XR, cycles: 4, pbc_fix: 0 },              // ae Absolute
            {mnemonic: ".LAX", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ACXR, cycles: 4, pbc_fix: 0 },           // af

            {mnemonic: "BCS", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // b0
            {mnemonic: "LDA", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // b1 (indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // b2 TILT
            {mnemonic: ".LAX", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_ACXR, cycles: 5, pbc_fix: 1 },        // b3

            {mnemonic: "LDY", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_YR, cycles: 4, pbc_fix: 0 },          // b4 Zeropage,X
            {mnemonic: "LDA", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // b5 Zeropage,X
            {mnemonic: "LDX", addr_mode: dist.consts.ZERO_PAGE_Y, source: dist.consts.M_ZERY, destination: dist.consts.M_XR, cycles: 4, pbc_fix: 0 },          // b6 Zeropage,Y
            {mnemonic: ".LAX", addr_mode: dist.consts.ZERO_PAGE_Y, source: dist.consts.M_ZERY, destination: dist.consts.M_ACXR, cycles: 4, pbc_fix: 0 },       // b7

            {mnemonic: "CLV", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FV, cycles: 2, pbc_fix: 0 },              // b8
            {mnemonic: "LDA", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // b9 Absolute,Y
            {mnemonic: "TSX", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_SP, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },                // ba
            {mnemonic: ".LAS", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_SABY, destination: dist.consts.M_ACXS, cycles: 4, pbc_fix: 1 },        // bb

            {mnemonic: "LDY", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_YR, cycles: 4, pbc_fix: 1 },           // bc Absolute,X
            {mnemonic: "LDA", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // bd Absolute,X
            {mnemonic: "LDX", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_XR, cycles: 4, pbc_fix: 1 },           // be Absolute,Y
            {mnemonic: ".LAX", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ACXR, cycles: 4, pbc_fix: 1 },        // bf

            {mnemonic: "CPY", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },           // c0 Immediate
            {mnemonic: "CMP", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_NONE, cycles: 6, pbc_fix: 0 },         // c1 (Indirect,X)
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },        // c2 occasional TILT
            {mnemonic: ".DCP", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // c3

            {mnemonic: "CPY", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },          // c4 Zeropage
            {mnemonic: "CMP", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },          // c5 Zeropage
            {mnemonic: "DEC", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // c6 Zeropage
            {mnemonic: ".DCP", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // c7

            {mnemonic: "INY", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_YR, destination: dist.consts.M_YR, cycles: 2, pbc_fix: 0 },                // c8
            {mnemonic: "CMP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },           // c9 Immediate
            {mnemonic: "DEX", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_XR, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },                // ca
            {mnemonic: ".SBX", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },            // cb

            {mnemonic: "CPY", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },            // cc Absolute
            {mnemonic: "CMP", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },            // cd Absolute
            {mnemonic: "DEC", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // ce Absolute
            {mnemonic: ".DCP", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // cf

            {mnemonic: "BNE", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // d0
            {mnemonic: "CMP", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_NONE, cycles: 5, pbc_fix: 1 },         // d1 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // d2 TILT
            {mnemonic: ".DCP", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // d3

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // d4
            {mnemonic: "CMP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },        // d5 Zeropage,X
            {mnemonic: "DEC", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // d6 Zeropage,X
            {mnemonic: ".DCP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // d7

            {mnemonic: "CLD", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FD, cycles: 2, pbc_fix: 0 },              // d8
            {mnemonic: "CMP", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },         // d9 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // da
            {mnemonic: ".DCP", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // db

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // dc
            {mnemonic: "CMP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },         // dd Absolute,X
            {mnemonic: "DEC", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // de Absolute,X
            {mnemonic: ".DCP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },        // df

            {mnemonic: "CPX", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },           // e0 Immediate
            {mnemonic: "SBC", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_AC, cycles: 6, pbc_fix: 0 },           // e1 (Indirect,X)
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },        // e2
            {mnemonic: ".ISB", addr_mode: dist.consts.INDIRECT_X, source: dist.consts.M_INDX, destination: dist.consts.M_INDX, cycles: 8, pbc_fix: 0 },        // e3

            {mnemonic: "CPX", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_NONE, cycles: 3, pbc_fix: 0 },          // e4 Zeropage
            {mnemonic: "SBC", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_AC, cycles: 3, pbc_fix: 0 },            // e5 Zeropage
            {mnemonic: "INC", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },          // e6 Zeropage
            {mnemonic: ".ISB", addr_mode: dist.consts.ZERO_PAGE, source: dist.consts.M_ZERO, destination: dist.consts.M_ZERO, cycles: 5, pbc_fix: 0 },         // e7

            {mnemonic: "INX", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_XR, destination: dist.consts.M_XR, cycles: 2, pbc_fix: 0 },                // e8
            {mnemonic: "SBC", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },             // e9 Immediate
            {mnemonic: "NOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // ea
            {mnemonic: ".USBC", addr_mode: dist.consts.IMMEDIATE, source: dist.consts.M_IMM, destination: dist.consts.M_AC, cycles: 2, pbc_fix: 0 },           // eb same as e9

            {mnemonic: "CPX", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },            // ec Absolute
            {mnemonic: "SBC", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },              // ed Absolute
            {mnemonic: "INC", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },             // ee Absolute
            {mnemonic: ".ISB", addr_mode: dist.consts.ABSOLUTE, source: dist.consts.M_ABS, destination: dist.consts.M_ABS, cycles: 6, pbc_fix: 0 },            // ef

            {mnemonic: "BEQ", addr_mode: dist.consts.RELATIVE, source: dist.consts.M_REL, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },            // f0
            {mnemonic: "SBC", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_AC, cycles: 5, pbc_fix: 1 },           // f1 (Indirect),Y
            {mnemonic: ".JAM", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 0, pbc_fix: 0 },           // f2 TILT
            {mnemonic: ".ISB", addr_mode: dist.consts.INDIRECT_Y, source: dist.consts.M_INDY, destination: dist.consts.M_INDY, cycles: 8, pbc_fix: 0 },        // f3

            {mnemonic: ".NOOP", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 0 },      // f4
            {mnemonic: "SBC", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 0 },          // f5 Zeropage,X
            {mnemonic: "INC", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },        // f6 Zeropage,X
            {mnemonic: ".ISB", addr_mode: dist.consts.ZERO_PAGE_X, source: dist.consts.M_ZERX, destination: dist.consts.M_ZERX, cycles: 6, pbc_fix: 0 },       // f7

            {mnemonic: "SED", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_FD, cycles: 2, pbc_fix: 0 },              // f8
            {mnemonic: "SBC", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // f9 Absolute,Y
            {mnemonic: ".NOOP", addr_mode: dist.consts.IMPLIED, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 2, pbc_fix: 0 },          // fa
            {mnemonic: ".ISB", addr_mode: dist.consts.ABSOLUTE_Y, source: dist.consts.M_ABSY, destination: dist.consts.M_ABSY, cycles: 7, pbc_fix: 0 },        // fb

            {mnemonic: ".NOOP", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_NONE, destination: dist.consts.M_NONE, cycles: 4, pbc_fix: 1 },       // fc
            {mnemonic: "SBC", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_AC, cycles: 4, pbc_fix: 1 },           // fd Absolute,X
            {mnemonic: "INC", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0 },         // fe Absolute,X
            {mnemonic: ".ISB", addr_mode: dist.consts.ABSOLUTE_X, source: dist.consts.M_ABSX, destination: dist.consts.M_ABSX, cycles: 7, pbc_fix: 0}          // ff
    ];

    dist.imageLoad = function (img) {
        if (dist.app_data.length == 0)
            dist.app_data.length = img.length;

        if (params.a78flag == 0) {
            if (dist.app_data.length == 2048)
                dist.app_data.end = 0x7ff;
            else if (dist.app_data.length == 4096)
                dist.app_data.end = 0xfff;
            else {
                throw "Error: .bin file must be 2048 or 4096 bytes\n" +
                    " for 2600 games; For 7800 games, .bin file must be\n" +
                    " 16384, 32768 or 49152 bytes (+128 bytes if header appended)\n" +
                    " Also, the -7 option must be set or unset appropriately\n";
            }
        }
        else // (a78flag == 1) 
        {
            switch (dist.app_data.length) {
                // No 8k 7800 roms exist, so there is no 8K support at this time                               
                case 8320:
                    dist.hdr_exists = dist.consts.YES_HEADER;
                case 8192:
                    dist.app_data.end = 0x1fff;
                    break;
                case 16512:
                    dist.hdr_exists = dist.consts.YES_HEADER;
                case 16384:
                    dist.app_data.end = 0x3fff;
                    break;
                case 32896:
                    dist.hdr_exists = dist.consts.YES_HEADER;
                case 32768:
                    dist.app_data.end = 0x7fff;
                    break;
                case 49280:
                    dist.hdr_exists = dist.consts.YES_HEADER;
                case 49152:
                    dist.app_data.end = 0xbfff;
                    break;
                default:
                    throw "Error: .bin file must be 2048 or 4096 bytes\n" +
                        " for 2600 games; For 7800 games, .bin file must be\n" +
                        " 16384, 32768 or 49152 bytes (+128 bytes if header appended)\n" +
                        " Also, the -7 option must be set or unset appropriately\n";
                    break;
            }
        }

        dist.mem = new Array(dist.app_data.length);

        // If it's got a 7800 header, get some info from it 
        if (dist.hdr_exists == dist.consts.YES_HEADER) {
            var hdr78 = new Array(128);

            // read in the 128-byte header 
            img.copyToArray(0, 128, dist.app_data.load, hdr78);
            //fread(&hdr78[app_data.load],1,128,fn);

            var hdr_string = "ACTUAL CART DATA STARTS HERE";

            // Exit if the header text string does not exist 
            for (var i = 0; i < 28; i++) {
                if (hdr_string[i] != String.fromCharCode(hdr78[100 + i])) {
                    throw "a78 file has incorrect header\n";
                }
            }
            // Header is correct, so check for POKEY support 
            if (hdr78[54] & 0x01 == 1) {
                // then it's a POKEY cart, so we turn on POKEY equates 
                params.kflag = 1;
            }
            else {
                // NOT a POKEY cart, so disable POKEY equates
                params.kflag = 0;
            }

            //read in the rest of the file (i.e. the data)
            dist.mem = new Array(img.lenght - 128);
            img.copyToArray(128, img.length - 128, dist.app_data.load, dist.mem);
            //fread(&mem[app_data.load],1,app_data.length-128,fn);
        }
        else // if no header exists, just read in the file data
        {
            dist.mem = img;
            //fread(&mem[app_data.load],1,app_data.length,fn);
        }

        if (dist.app_data.start == 0)
            dist.app_data.start = dist.app_data.load;
    };

    dist.read_adr = function () {
        var d1, d2;
        d1 = dist.mem[dist.pc++];
        d2 = dist.mem[dist.pc++];
        return ((d2 << 8) + d1);
    };

    dist.mark = function (address, bit) {
        /*-----------------------------------------------------------------------
        For any given offset and code range...

        If we're bewteen the offset and the end of the code range, we mark
        the bit in the labels array for that data.  The labels array is an
        array of label info for each code address.  If this is the case,
        return "1", else...

        We sweep for hardware/system equates, which are valid addresses,
        outside the scope of the code/data range.  For these, we mark its
        corresponding hardware/system array element, and return "2", "3", or
        "5" (depending on which system/hardware element was accesed).  If this
        was not the case...

        Next we check if it is a code "mirror".  For the 2600, address ranges
        are limited with 13 bits, so other addresses can exist outside of the
        standard code/data range.  For these, we mark the element in the "labels"
        array that corresponds to the mirrored address, and return "4"

        If all else fails, it's not a valid address, so return 0.



        A quick example breakdown for a 2600 4K cart:
        ===========================================================
        $00-$3d = system equates (WSYNC, etc...); mark the array's element
        with the appropriate bit; return 2.
        $0280-$0297 = system equates (INPT0, etc...); mark the array's element
        with the appropriate bit; return 3.
        $1000-$1FFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $3000-$3FFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $5000-$5FFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $7000-$7FFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $9000-$9FFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $B000-$BFFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $D000-$DFFF = CODE/DATA, mark the code/data array for the mirrored address
        with the appropriate bit; return 4.
        $F000-$FFFF = CODE/DATA, mark the code/data array for the address
        with the appropriate bit; return 1.
        Anything else = invalid, return 0.
        ===========================================================
        -----------------------------------------------------------------------*/

        if (address >= dist.offset && address <= dist.app_data.end + dist.offset) {
            dist.labels[address - dist.offset] = dist.labels[address - dist.offset] | bit;
            return 1;
        }
        else if (address >= 0 && address <= 0x3d && params.a78flag == 0) {
            dist.reserved[address] = 1;
            return 2;
        }
        else if (address >= 0x280 && address <= 0x297 && params.a78flag == 0) {
            dist.ioresrvd[address - 0x280] = 1;
            return 3;
        }
        else if (address >= 0 && address <= 0x3f && params.a78flag == 1) {
            dist.reserved[address] = 1;
            return 2;
        }
        else if (address >= 0x280 && address <= 0x283 && params.a78flag == 1) {
            dist.ioresrvd[address - 0x280] = 1;
            return 3;
        }
        else if (address >= 0x4000 && address <= 0x400f && params.a78flag == 1 && params.kflag == 1) {
            dist.pokresvd[address - 0x4000] = 1;
            return 5;
        }
        else if (address > 0x8000 && params.a78flag == 1 && dist.app_data.end == 0x3FFF) {
            /* 16K case */
            dist.labels[address & dist.app_data.end] = dist.labels[address & dist.app_data.end] | bit;
            return 4;
        }
        else if (address > 0x4000 && address <= 0x7fff && params.a78flag == 1 && dist.app_data.end == 0x7fff) {
            /* 32K case */
            dist.labels[address - 0x4000] = dist.labels[address - 0x4000] | bit;
            return 4;
        }
        else if (address > 0x1000 && params.a78flag == 0) {
            /* 2K & 4K case */
            dist.labels[address & dist.app_data.end] = dist.labels[address & dist.app_data.end] | bit;
            return 4;
        }
        else
            return 0;
    };

    dist.check_bit = function (bitflags, i) {
        var j;

        bitflags = bitflags & i;
        j = bitflags;
        return j;
    };

    dist.disasm = function (distart, pass) {
        var op;
        var d1, opsrc;
        var ad;
        var amode;
        var i, bytes, labfound, addbranch;

        /*    pc=app_data.start; */
        dist.pc = distart - dist.offset;
        while (dist.pc <= dist.app_data.end) {
            if (pass == 3) {
                if (dist.pc + dist.offset == dist.start_adr)
                    dist.asm += sprintf("\nSTART:\n");
                if ((dist.pc + dist.offset == dist.brk_adr) && (dist.bflag))
                    dist.asm += sprintf("\nBRK_ROUTINE:\n");
                if ((dist.pc + dist.offset == dist.isr_adr) && ((params.a78flag == 1) && (dist.intflag == 1)))
                    dist.asm += sprintf("\nINTERRUPT_ROUTINE:\n");
            }
            if (dist.check_bit(dist.labels[dist.pc], dist.consts.GFX)) {
                /*         && !check_bit(labels[pc],REACHABLE)) { */
                if (pass == 2)
                    dist.mark(dist.pc + dist.offset, dist.consts.VALID_ENTRY);
                if (pass == 3) {
                    if (dist.check_bit(dist.labels[dist.pc], dist.consts.REFERENCED))
                        dist.asm += sprintf("L%0.4X: ", dist.pc + dist.offset);
                    else
                        dist.asm += sprintf("       ", dist.pc + dist.offset);
                    dist.asm += sprintf(".byte $%0.2X ; ", dist.mem[dist.pc]);
                    dist.showgfx(dist.mem[dist.pc]);
                    dist.asm += sprintf(" $%0.4X\n", dist.pc + dist.offset);
                }
                dist.pc++;
            } else
                if (dist.check_bit(dist.labels[dist.pc], dist.consts.DATA) && !dist.check_bit(dist.labels[dist.pc], dist.consts.GFX)) {
                    /*            && !check_bit(labels[pc],REACHABLE)) {  */
                    dist.mark(dist.pc + dist.offset, dist.consts.VALID_ENTRY);
                    if (pass == 3) {
                        bytes = 1;
                        dist.asm += sprintf("L%0.4X: .byte ", dist.pc + dist.offset);
                        dist.asm += sprintf("$%0.2X", dist.mem[dist.pc]);
                    }
                    dist.pc++;

                    while (dist.check_bit(dist.labels[dist.pc], dist.consts.DATA) && !dist.check_bit(dist.labels[dist.pc], dist.consts.REFERENCED)
                   && !dist.check_bit(dist.labels[dist.pc], dist.consts.GFX) && pass == 3 && dist.pc <= dist.app_data.end) {
                        if (pass == 3) {
                            bytes++;
                            if (bytes == 17) {
                                dist.asm += sprintf("\n       .byte $%0.2X", dist.mem[dist.pc]);
                                bytes = 1;
                            } else
                                dist.asm += sprintf(",$%0.2X", dist.mem[dist.pc]);
                        }
                        dist.pc++;
                    }
                    if (pass == 3)
                        dist.asm += sprintf("\n");
                } else {
                    op = dist.mem[dist.pc];
                    /* version 2.1 bug fix */
                    if (pass == 2)
                        dist.mark(dist.pc + dist.offset, dist.consts.VALID_ENTRY);
                    if (pass == 3)
                        if (dist.check_bit(dist.labels[dist.pc], dist.consts.REFERENCED)) {
                            dist.asm += sprintf("L%0.4X: ", dist.pc + dist.offset);
                        } else
                            dist.asm += sprintf("       ");

                    amode = dist.lookup[op].addr_mode;
                    if (dist.app_data.disp_data) {
                        for (i = 0; i < clength[amode]; i++) {
                            if (pass == 3)
                                dist.asm += sprintf("%02X ", dist.mem[dist.pc + i]);
                        }
                        if (pass == 3)
                            dist.asm += sprintf("  ");
                    }

                    dist.pc++;

                    if (dist.lookup[op].mnemonic[0] == '.') {
                        amode = dist.consts.IMPLIED;
                        if (pass == 3) {
                            dist.linebuff = sprintf(".byte $%0.2X ;", op);
                            dist.nextline += dist.linebuff;
                        }
                    }

                    if (pass == 1) {
                        opsrc = dist.lookup[op].source;
                        /* M_REL covers BPL, BMI, BVC, BVS, BCC, BCS, BNE, BEQ
                        M_ADDR = JMP $NNNN, JSR $NNNN
                        M_AIND = JMP Abs, Indirect */
                        if ((opsrc == dist.consts.M_REL) || (opsrc == dist.consts.M_ADDR) || (opsrc == dist.consts.M_AIND)) {
                            addbranch = 1;
                        }
                        else
                            addbranch = 0;
                    } else if (pass == 3) {
                        dist.linebuff = sprintf("%s", dist.lookup[op].mnemonic);
                        dist.nextline += dist.linebuff;
                    }

                    if (dist.pc >= dist.app_data.end) {
                        switch (amode) {
                            case dist.consts.ABSOLUTE:
                            case dist.consts.ABSOLUTE_X:
                            case dist.consts.ABSOLUTE_Y:
                            case dist.consts.INDIRECT_X:
                            case dist.consts.INDIRECT_Y:
                            case dist.consts.ABS_INDIRECT:
                                {
                                    if (pass == 3) {
                                        /* Line information is already printed; append .byte since last instruction will
                                        put recompilable object larger that original binary file */
                                        dist.asm += sprintf(".byte $%0.2X\n", op);

                                        if (dist.pc == dist.app_data.end) {
                                            if (dist.check_bit(dist.labels[dist.pc], dist.consts.REFERENCED)) {
                                                dist.asm += sprintf("L%0.4X: ", dist.pc + dist.offset);
                                            } else
                                                dist.linebuff = sprintf("       ");
                                            op = dist.mem[dist.pc++];
                                            dist.asm += sprintf(".byte $%0.2X\n", op);
                                        }
                                    }
                                    dist.pcend = dist.app_data.end + dist.offset;
                                    return;
                                }
                            case dist.consts.ZERO_PAGE:
                            case dist.consts.IMMEDIATE:
                            case dist.consts.ZERO_PAGE_X:
                            case dist.consts.ZERO_PAGE_Y:
                            case dist.consts.RELATIVE:
                                {
                                    if (dist.pc > dist.app_data.end) {
                                        if (pass == 3) {
                                            /* Line information is already printed, but we can remove the
                                            Instruction (i.e. BMI) by simply clearing the buffer to print */
                                            dist.nextline = "";
                                            dist.linebuff = sprintf(".byte $%0.2X", op);
                                            dist.nextline += dist.linebuff;

                                            dist.asm += dist.nextline + "\n";
                                            //dist.linebuff = sprintf("%s", nextline);
                                            //dist.linebuff = sprintf("\n");
                                            dist.nextline = "";
                                        }
                                        dist.pc++;
                                        dist.pcend = dist.app_data.end + dist.offset;
                                        return;
                                    }
                                }
                            default:
                                break;
                        }
                    }

                    /* Version 2.1 added the extensions to mnemonics */
                    switch (amode) {
                        /*              case IMPLIED: {
                        if (op == 0x40 || op == 0x60)
                        if (pass == 3) {
                        dist.linebuff = sprintf(linebuff,"\n");
                        strcat(nextline,linebuff);
                        }
                        break;
                        }
                        */ 
                        case dist.consts.ACCUMULATOR:
                            {
                                if (pass == 3)
                                    if (params.aflag == 1) {
                                        dist.linebuff = sprintf("    A");
                                        dist.nextline += dist.linebuff;
                                    }
                                break;
                            }
                        case dist.consts.ABSOLUTE:
                            {
                                ad = dist.read_adr();
                                labfound = dist.mark(ad, dist.consts.REFERENCED);
                                if (pass == 1) {
                                    if ((addbranch) && !dist.check_bit(dist.labels[ad & dist.app_data.end], dist.consts.REACHABLE)) {
                                        if (ad > 0xfff)
                                            dist.addressq.enqueue((ad & dist.app_data.end) + dist.offset);
                                        dist.mark(ad, dist.consts.REACHABLE);

                                    }
                                } else if (pass == 3) {
                                    if (ad < 0x100 && params.fflag) {
                                        dist.linebuff = sprintf(".w  ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    if (labfound == 1) {
                                        dist.linebuff = sprintf("L%0.4X", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 3) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("%s", dist.consts.ioregs[ad - 0x280]);
                                        else
                                            dist.linebuff = sprintf("%s", dist.consts.mariaio[ad - 0x280]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 5) {
                                        dist.linebuff = sprintf("%s", dist.consts.pokey[ad - 0x4000]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if ((labfound == 4) && params.rflag) {
                                        dist.linebuff = sprintf("L%0.4X", (ad & dist.app_data.end) + dist.offset);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("$%0.4X", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                }
                                break;
                            }
                        case dist.consts.ZERO_PAGE:
                            {
                                d1 = dist.mem[this.pc++];
                                labfound = dist.mark(d1, dist.consts.REFERENCED);
                                if (pass == 3)
                                    if (labfound == 2) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("    %s", dist.consts.stella[d1]);
                                        else
                                            dist.linebuff = sprintf("    %s", dist.consts.maria[d1]);
                                        dist.nextline += dist.linebuff;
                                    } else {
                                        dist.linebuff = sprintf("    $%0.2X ", d1);
                                        dist.nextline += dist.linebuff;
                                    }
                                break;
                            }
                        case dist.consts.IMMEDIATE:
                            {
                                d1 = dist.mem[dist.pc++];
                                if (pass == 3) {
                                    dist.linebuff = sprintf("    #$%0.2X ", d1);
                                    dist.nextline += dist.linebuff;
                                }
                                break;
                            }
                        case dist.consts.ABSOLUTE_X:
                            {
                                ad = dist.read_adr();
                                labfound = dist.mark(ad, dist.consts.REFERENCED);
                                if (pass == 3) {
                                    if (ad < 0x100 && params.fflag) {
                                        dist.linebuff = sprintf(".wx ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    if (labfound == 1) {
                                        dist.linebuff = sprintf("L%0.4X,X", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 3) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("%s,X", dist.consts.ioregs[ad - 0x280]);
                                        else
                                            dist.linebuff = sprintf("%s,X", dist.consts.mariaio[ad - 0x280]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 5) {
                                        dist.linebuff = sprintf("%s,X", dist.consts.pokey[ad - 0x4000]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if ((labfound == 4) && params.rflag) {
                                        dist.linebuff = sprintf("L%0.4X,X", (ad & dist.app_data.end) + dist.offset);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("$%0.4X,X", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                }
                                break;
                            }
                        case dist.consts.ABSOLUTE_Y:
                            {
                                ad = dist.read_adr();
                                labfound = dist.mark(ad, dist.consts.REFERENCED);
                                if (pass == 3) {
                                    if (ad < 0x100 && params.fflag) {
                                        dist.linebuff = sprintf(".wy ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    if (labfound == 1) {
                                        dist.linebuff = sprintf("L%0.4X,Y", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 3) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("%s,Y", dist.consts.ioregs[ad - 0x280]);
                                        else
                                            dist.linebuff = sprintf("%s,Y", dist.consts.mariaio[ad - 0x280]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if (labfound == 5) {
                                        dist.linebuff = sprintf("%s,Y", dist.consts.pokey[ad - 0x4000]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else if ((labfound == 4) && params.rflag) {
                                        dist.linebuff = sprintf("L%0.4X,Y", (ad & dist.app_data.end) + dist.offset);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("$%0.4X,Y", ad);
                                        dist.nextline += dist.linebuff;
                                    }
                                }
                                break;
                            }
                        case dist.consts.INDIRECT_X:
                            {
                                d1 = dist.mem[dist.pc++];
                                if (pass == 3) {
                                    dist.linebuff = sprintf("    ($%0.2X,X)", d1);
                                    dist.nextline += dist.linebuff;
                                }
                                break;
                            }
                        case dist.consts.INDIRECT_Y:
                            {
                                d1 = dist.mem[dist.pc++];
                                if (pass == 3) {
                                    dist.linebuff = sprintf("    ($%0.2X),Y", d1);
                                    dist.nextline += dist.linebuff;
                                }
                                break;
                            }
                        case dist.consts.ZERO_PAGE_X:
                            {
                                d1 = dist.mem[dist.pc++];
                                labfound = dist.mark(d1, dist.consts.REFERENCED);
                                if (pass == 3)
                                    if (labfound == 2) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("    %s,X", dist.consts.stella[d1]);
                                        else
                                            dist.linebuff = sprintf("    %s,X", dist.consts.maria[d1]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    $%0.2X,X", d1);
                                        dist.nextline += dist.linebuff;
                                    }
                                break;
                            }
                        case dist.consts.ZERO_PAGE_Y:
                            {
                                d1 = dist.mem[dist.pc++];
                                labfound = dist.mark(d1, dist.consts.REFERENCED);
                                if (pass == 3)
                                    if (labfound == 2) {
                                        if (params.a78flag == 0)
                                            dist.linebuff = sprintf("    %s,Y", dist.consts.stella[d1]);
                                        else
                                            dist.linebuff = sprintf("    %s,Y", dist.consts.maria[d1]);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    $%0.2X,Y", d1);
                                        dist.nextline += dist.linebuff;
                                    }
                                break;
                            }
                        case dist.consts.RELATIVE:
                            {
                                d1 = dist.mem[dist.pc++];
                                ad = d1;
                                if (d1 >= 128) ad = d1 - 256;
                                labfound = dist.mark(dist.pc + ad + dist.offset, dist.consts.REFERENCED);
                                if (pass == 1) {
                                    if ((addbranch) && !dist.check_bit(dist.labels[dist.pc + ad], dist.consts.REACHABLE)) {
                                        dist.addressq.enqueue(dist.pc + ad + dist.offset);
                                        dist.mark(dist.pc + ad + dist.offset, dist.consts.REACHABLE);
                                        /*       addressq=addq(addressq,pc+offset); */
                                    }
                                } else if (pass == 3)
                                    if (labfound == 1) {
                                        dist.linebuff = sprintf("    L%0.4X", dist.pc + ad + dist.offset);
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    $%0.4X", dist.pc + ad + dist.offset);
                                        dist.nextline += dist.linebuff;
                                    }

                                break;
                            }
                        case dist.consts.ABS_INDIRECT:
                            {
                                ad = dist.read_adr();
                                labfound = dist.mark(ad, dist.consts.REFERENCED);
                                if (pass == 3)
                                    if (ad < 0x100 && params.fflag) {
                                        dist.linebuff = sprintf(".ind ");
                                        dist.nextline += dist.linebuff;
                                    }
                                    else {
                                        dist.linebuff = sprintf("    ");
                                        dist.nextline += dist.linebuff;
                                    }
                                if (labfound == 1) {
                                    dist.linebuff = sprintf("(L%04X)", ad);
                                    dist.nextline += dist.linebuff;
                                }
                                else if (labfound == 3) {
                                    if (params.a78flag == 0)
                                        dist.linebuff = sprintf("(%s)", dist.consts.ioregs[ad - 0x280]);
                                    else
                                        dist.linebuff = sprintf("(%s)", dist.consts.mariaio[ad - 0x280]);
                                    dist.nextline += dist.linebuff;
                                }
                                else if (labfound == 5) {
                                    dist.linebuff = sprintf("(%s)", dist.consts.pokey[ad - 0x4000]);
                                    dist.nextline += dist.linebuff;
                                }
                                else {
                                    dist.linebuff = sprintf("($%04X)", ad);
                                    dist.nextline += dist.linebuff;
                                }
                                break;
                            }
                    }
                    if (pass == 1) {
                        if (dist.lookup[op].mnemonic == "RTS" || dist.lookup[op].mnemonic == "JMP" || /*!strcmp(lookup[op].mnemonic,"BRK") || */dist.lookup[op].mnemonic == "RTI") {
                            dist.pcend = (dist.pc - 1) + dist.offset;
                            return;
                        }
                    }
                    else if (pass == 3) {
                        dist.asm += sprintf("%s", dist.nextline);
                        if (dist.nextline.length <= 15) {
                            /* Print spaces to allign cycle count data */
                            for (var charcnt = 0; charcnt < 15 - dist.nextline.length; charcnt++)
                                dist.asm += sprintf(" ");
                        }
                        if (params.sflag)
                            dist.asm += sprintf(";%d", dist.lookup[op].cycles);
                        dist.asm += sprintf("\n");
                        if (op == 0x40 || op == 0x60)
                            dist.asm += sprintf("\n");
                        dist.nextline = "";
                    }
                }
        }    /* while loop */
        /* Just in case we are disassembling outside of the address range, force the pcend to EOF */
        dist.pcend = dist.app_data.end + dist.offset;
    };

    dist.teste = function () {
        alert(dist.consts.stella[0]);
    }

    dist.mem = null; // copied data from the file-- can be from 2K-48K bytes in size
    dist.labels = null; // array of information about addresses-- can be from 2K-48K bytes in size
    dist.addressq = new Queue();

    dist.reserved = new Array(64);
    dist.ioresrvd = new Array(24);
    dist.pokresvd = new Array(16);
    dist.orgmnc = "   ORG ";
    dist.linebuff = "";
    dist.nextline = "";
    dist.asm = "";

    dist.pc = 0;
    dist.pcbeg = 0;
    dist.pcend = 0;
    dist.offset = 0;
    dist.brk_adr = 0;
    dist.start_adr = 0;
    dist.isr_adr = 0;
    dist.k = 0;

    params.aflag = params.aflag == undefined ? 1 : params.aflag;
    params.cflag = params.cflag == undefined ? 0 : params.cflag;
    params.fflag = params.fflag == undefined ? 0 : params.fflag;
    params.kflag = params.kflag == undefined ? 0 : params.kflag;
    params.pflag = params.pflag == undefined ? 0 : params.pflag;
    params.sflag = params.sflag == undefined ? 0 : params.sflag;
    params.rflag = params.rflag == undefined ? 0 : params.rflag;
    params.dflag = params.dflag == undefined ? 1 : params.dflag;
    params.a78flag = params.a78flag == undefined ? 0 : params.a78flag;

    dist.intflag = 0;
    dist.bflag = false;
    dist.lineno = 0;
    dist.hdr_exists = dist.consts.NO_HEADER;

    dist.imageLoad(img);

    dist.labels = new Array(dist.app_data.length);

    /*-----------------------------------------------------
    The last 3 words of a program are as follows:

    .word	INTERRUPT   (isr_adr)
    .word	START       (start_adr)
    .word	BRKroutine  (brk_adr)

    Since we always process START, move the Program
    Counter 3 bytes back from the final byte.
    -----------------------------------------------------*/

    dist.pc = dist.app_data.end - 3;
    dist.start_adr = dist.read_adr();

    if (dist.app_data.end == 0x7ff) /* 2K case */
    {
        /*============================================
        What is the offset?  Well, it's an address
        where the code segment starts.  For a 2K game,
        it is usually 0xf800, which would then have the
        code data end at 0xffff, but that is not
        necessarily the case.  Because the Atari 2600
        only has 13 address lines, it's possible that
        the "code" can be considered to start in a lot
        of different places.  So, we use the start
        address as a reference to determine where the
        offset is, logically-anded to produce an offset
        that is a multiple of 2K.

        Example:
        Start address = $D973, so therefore
        Offset to code = $D800
        Code range = $D800-$DFFF
        =============================================*/
        dist.offset = (dist.start_adr & 0xf800);
    }
    else if (dist.app_data.end == 0xfff) /* 4K case */
    {
        /*============================================
        The offset is the address where the code segment
        starts.  For a 4K game, it is usually 0xf000,
        which would then have the code data end at 0xffff,
        but that is not necessarily the case.  Because the
        Atari 2600 only has 13 address lines, it's possible
        that the "code" can be considered to start in a lot
        of different places.  So, we use the start
        address as a reference to determine where the
        offset is, logically-anded to produce an offset
        that is a multiple of 4K.

        Example:
        Start address = $D973, so therefore
        Offset to code = $D000
        Code range = $D000-$DFFF
        =============================================*/
        dist.offset = (dist.start_adr - (dist.start_adr % 0x1000));
    }
    else if (dist.app_data.end == 0x1fff) /* 8K case (7800 mode only-- file size is not supported by file_load function) */
        dist.offset = (dist.start_adr & 0xe000);
    else if (dist.app_data.end == 0x3fff) /* 16K case (7800 mode only) */
    {
        /*============================================
        The offset is the address where the code segment starts.
        For a 16K game (it must be Atari 7800 then), it should
        always be at $C000, creating a code range from $C000-
        $CFFF.

        Data outside of this 16K range (i.e. $8000-$BFFF) would
        probably act as a mirror of $C000-$FFFF, therefore acting
        as if it referenced data within the $C000-$FFFF range.
        It is unknown if any 16K 7800 games access
        this mirror, but if so, the mark() function will
        note that the correct address ($C000-$FFFF) is marked
        accordingly.
        For the purposes of this disassembler, references
        to data from $4000-$7FFF for 16K games are ignored.
        =============================================*/
        dist.offset = (dist.start_adr & 0xc000);
    }
    else if (dist.app_data.end == 0x7fff) /* 32K case (7800 mode only) */
    {
        /*============================================
        The offset is the address where the code segment starts.
        For a 32K game (it must be Atari 7800 then), it should
        always be at $C000.

        Example:
        Offset to code = $8000
        Code range = $8000-$FFFF

        Data outside of this 32K range (i.e. $4000-$7FFF) for 32K
        games would either be interpreted as $$8000-$CFFF's data,
        or may even be undefined.
        It is unknown if any 32K 7800 games access
        this mirror, but if so, the mark() function will
        note that the correct address ($8000-$CFFF) is marked
        accordingly.
        =============================================*/
        dist.offset = (0x8000);
    }
    else if (dist.app_data.end == 0xbfff) /* 48K case (7800 mode only) */
    {
        /*=====================================================
        if 48K, the CODE data must ALWAYS start at $4000.
        The CODE range will be $4000-$FFFF, and $0000-$3FFF
        are reserved internal to the 7800 system.
        =====================================================*/
        dist.offset = (0x4000);
        /*-----------------------------------------------------
        if the r flag is on, we don't need it to be,
        because there is nothing to relocate for the 48K
        case-- all addresses are fixed and known.  The
        lower 16K is system, and the upper 48K are code.
        -----------------------------------------------------*/
        params.rflag = 0;
        /*-----------------------------------------------------
        Likewise, the k flag must be off, since 48K games
        cannot support POKEY hardware.  The POKEY hardware
        would be in 16K segment 2, but that's where some code
        is for a 48K situation.  Since they're mutually
        exclusive, POKEY capability with a 48K game is
        not practical.
        -----------------------------------------------------*/
        params.kflag = 0;
    }

    dist.addressq.enqueue(dist.start_adr);

    dist.brk_adr = dist.read_adr();
    if (dist.intflag == 1 && params.a78flag == 0) {
        dist.bflag = true;
    }

    /*--------------------------------------------------------
    If Atari 2600 OR Atari 7800 mode,
    if the "-b" option is on, process BRKroutine
    if the "-b" option is off, don't process BRKroutine
    --------------------------------------------------------*/
    if (dist.bflag) {
        dist.addressq.enqueue(dist.brk_adr);
        dist.mark(dist.brk_adr, dist.consts.REFERENCED);
    }

    /*--------------------------------------------------------
    If Atari 7800 mode,
    if the "-i" option is on, process ISR routine
    if the "-i" option is off, don't process ISR routine

    To do this, we need to move the Program counter appropriately.
    --------------------------------------------------------*/
    if (dist.intflag == 1 && params.a78flag == 1) {
        dist.pc = dist.app_data.end - 5;
        dist.isr_adr = dist.read_adr();
        dist.addressq.enqueue(dist.isr_adr);
        dist.mark(dist.isr_adr, dist.consts.REFERENCED);
    }

    if (params.dflag) {
        while (!dist.addressq.isEmpty()) {
            dist.pc = dist.addressq.dequeue();
            dist.pcbeg = dist.pc;
            //addressq=delq(addressq);
            dist.disasm(dist.pc, 1);
            for (var k = dist.pcbeg; k <= dist.pcend; k++)
                dist.mark(k, dist.consts.REACHABLE);
        }

        for (var k = 0; k <= dist.app_data.end; k = k + 1) {
            if (!dist.check_bit(dist.labels[k], dist.consts.REACHABLE))
                dist.mark(k + dist.offset, dist.consts.DATA);
        }
    }

    dist.disasm(dist.offset, 2);

    dist.header = "";

    //sprintf(dist.header,"; Disassembly of %s\n",file);
    //sprintf(dist.header,"; Disassembled %s",ctime(&currtime));
    dist.header += sprintf("; Using distella.js;\n");
    //sprintf(dist.header,"; Command Line: %s\n;\n",parms);
    //if (cflag) {
    //    sprintf(dist.header,"; %s contents:\n;\n",config);
    //    while (fgets(parms,79,cfg) != NULL)
    //        sprintf(dist.header,";      %s",parms);
    //}
    dist.header += sprintf("\n");
    if (params.pflag)
        dist.header += sprintf("      processor 6502\n");

    /* Print list of used equates onto the screen (TIA) if 2600 mode */
    if (params.a78flag == 0) {
        for (var i = 0; i <= 0x3d; i++)
            if (dist.reserved[i] == 1) {
                dist.header += sprintf("%s", dist.consts.stella[i]);
                for (var j = dist.consts.stella[i].length; j < 7; j++)
                    dist.header += sprintf(" ");
                dist.header += sprintf(" =  $%0.2X\n", i);
            }

        for (var i = 0x280; i <= 0x297; i++)
            if (dist.ioresrvd[i - 0x280] == 1) {
                dist.header += sprintf("%s", dist.consts.ioregs[i - 0x280]);
                for (var j = dist.consts.ioregs[i - 0x280].length; j < 7; j++)
                    dist.header += sprintf(" ");
                dist.header += sprintf(" =  $%0.4X\n", i);
            }
    }
    else {
        /* Print list of used equates onto the screen (MARIA) if 7800 mode */
        for (var i = 0; i <= 0x3f; i++)
            if (dist.reserved[i] == 1) {
                dist.header += sprintf("%s", dist.consts.maria[i]);
                for (var j = dist.consts.maria[i].length; j < 7; j++)
                    dist.header += sprintf(" ");
                dist.header += sprintf(" =  $%0.2X\n", i);
            }

        for (var i = 0x280; i <= 0x283; i++)
            if (dist.ioresrvd[i - 0x280] == 1) {
                dist.header += sprintf("%s", dist.consts.mariaio[i - 0x280]);
                for (var j = dist.consts.mariaio[i - 0x280].length; j < 7; j++)
                    dist.header += sprintf(" ");
                dist.header += sprintf(" =  $%0.4X\n", i);
            }

        if (params.kflag == 1) {
            for (var i = 0x4000; i <= 0x400f; i++)
                if (dist.pokresvd[i - 0x4000] == 1) {
                    dist.header += sprintf("%s", dist.consts.pokey[i - 0x4000]);
                    for (var j = dist.consts.pokey[i - 0x4000].length; j < 7; j++)
                        dist.header += sprintf(" ");
                    dist.header += sprintf(" =  $%0.4X\n", i);
                }
        }
    }


    /* Print Line equates on screen */
    for (var i = 0; i <= dist.app_data.end; i++) {
        if ((dist.labels[i] & (dist.consts.REFERENCED | dist.consts.VALID_ENTRY)) == dist.consts.REFERENCED) {
            /* so, if we have a piece of code referenced somewhere else, but cannot locate the label
            in code (i.e because the address is inside of a multi-byte instruction, then we
            print that address on screen for reference */
            dist.header += sprintf("L%0.4X   =   ", i + dist.offset);
            dist.header += sprintf("$%0.4X\n", i + dist.offset);
        }
    }

    dist.header += sprintf("\n");
    dist.header += sprintf("    %s", dist.orgmnc);
    dist.header += sprintf("$%0.4X\n", dist.offset);

    dist.linebuff = "";
    dist.nextline = "";
    dist.disasm(dist.offset, 3);
}