
function run_adlif_simulation({
    u0,
    timesteps = 200,
    alpha = 0.98,
    beta = 0.98,
    a = 20,
    b = 0,
    input_current = 0.0,
    threshold = 1.0,
    u_rest = 0.0
}) {
    let u = [u0];
    let w = [0];
    let s = [0];
    let u_hat = [];

    for (let t = 1; t < timesteps; t++) {
        const u_hat_t = alpha * u[t - 1] + (1 - alpha) * (-w[t - 1] + input_current);
        u_hat.push(u_hat_t);

        const s_t = u_hat_t > threshold ? 1 : 0;
        s.push(s_t);

        const u_t = u_hat_t * (1 - s_t) + u_rest * s_t;
        u.push(u_t);

        const w_t = beta * w[t - 1] + (1 - beta) * (a * u_t + b * s_t);
        w.push(w_t);
    }
    return { u, w, s };
}
