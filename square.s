	.file	"square.c"
	.option nopic
	.attribute arch, "rv64i2p1_m2p0_a2p1_f2p2_d2p2_c2p0_zicsr2p0"
	.attribute unaligned_access, 0
	.attribute stack_align, 16
	.text
	.align	1
	.globl	square
	.type	square, @function
square:
	mulw	a0,a0,a0
	ret
	.size	square, .-square
	.ident	"GCC: (13.2.0-11ubuntu1+12) 13.2.0"
