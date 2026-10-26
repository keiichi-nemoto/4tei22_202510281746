# オリジナルのロボットが「フェード・イン」して鳥型に変形するまでを、図と式で見せる
# 使い方: manim -qh video/manim/robot_transform.py RobotTransform
import numpy as np
from manim import *

FONT = "IPAGothic"
ROBO = BLUE_C
ACCENT = YELLOW
GEM = RED_C


def jp(text, size=30, color=WHITE):
    return Text(text, font=FONT, font_size=size, color=color)


class RobotTransform(Scene):
    def construct(self):
        # ---- タイトル ----
        title = jp("変形の数式　ロボ → バード", 44)
        self.play(Write(title), run_time=1.2)
        self.wait(0.6)
        self.play(title.animate.scale(0.55).to_corner(UL))

        # ---- ロボット（線と図形だけのオリジナル） ----
        c = np.array([-3.0, -0.3, 0])  # 胴体の中心
        torso = Polygon(c + [-0.8, 0.9, 0], c + [0.8, 0.9, 0],
                        c + [0.5, -0.6, 0], c + [-0.5, -0.6, 0],
                        color=ROBO, fill_opacity=0.25)
        head = Square(0.55, color=ROBO, fill_opacity=0.25).move_to(c + [0, 1.3, 0])
        eye = Line(c + [-0.15, 1.33, 0], c + [0.15, 1.33, 0], color=ACCENT, stroke_width=6)
        gem = Circle(0.14, color=GEM, fill_opacity=0.9).move_to(c + [0, 0.4, 0])
        sh_l, sh_r = c + [-0.95, 0.8, 0], c + [0.95, 0.8, 0]
        arm_base_l = Rectangle(width=0.28, height=1.4, color=ROBO, fill_opacity=0.25).next_to(sh_l, DOWN, buff=0)
        arm_base_r = Rectangle(width=0.28, height=1.4, color=ROBO, fill_opacity=0.25).next_to(sh_r, DOWN, buff=0)
        leg_l = Rectangle(width=0.32, height=1.3, color=ROBO, fill_opacity=0.25).next_to(c + [-0.3, -0.6, 0], DOWN, buff=0)
        leg_r = Rectangle(width=0.32, height=1.3, color=ROBO, fill_opacity=0.25).next_to(c + [0.3, -0.6, 0], DOWN, buff=0)

        theta = ValueTracker(0)  # 腕の角度（度）
        arm_l = always_redraw(lambda: arm_base_l.copy().rotate(-theta.get_value() * DEGREES, about_point=sh_l))
        arm_r = always_redraw(lambda: arm_base_r.copy().rotate(theta.get_value() * DEGREES, about_point=sh_r))

        body = VGroup(torso, head, eye, leg_l, leg_r)
        self.play(LaggedStart(*[Create(m) for m in body], lag_ratio=0.15), run_time=1.5)
        self.add(arm_l, arm_r)
        self.play(FadeIn(arm_l), FadeIn(arm_r), run_time=0.5)

        # ---- 1. フェード・イン（放物線で飛び込む） ----
        h1 = jp("① フェード・イン", 32, ACCENT).to_edge(RIGHT, buff=1.2).shift(UP * 2.2)
        eq1 = jp("y = h − ½ g t²", 34).next_to(h1, DOWN, buff=0.35)
        self.play(FadeIn(h1, shift=LEFT * 0.3), Write(eq1))

        start = c + [3.2, -2.6, 0]
        end = gem.get_center()
        top_y = 2.4
        # 始点→頂点→終点を通る放物線
        def path_fn(t):
            x = start[0] + (end[0] - start[0]) * t
            y0 = start[1] + (end[1] - start[1]) * t
            return np.array([x, y0 + 4 * (top_y - max(start[1], end[1])) * t * (1 - t), 0])
        arc = ParametricFunction(path_fn, t_range=[0, 1], color=ACCENT)
        dashed = DashedVMobject(arc, num_dashes=30)
        pilot = Dot(start, color=ACCENT, radius=0.1)
        self.play(FadeIn(pilot, scale=2), Create(dashed), run_time=1)
        self.play(MoveAlongPath(pilot, arc), run_time=1.6, rate_func=rate_functions.ease_in_quad)
        self.play(FadeOut(pilot), FadeIn(gem, scale=3), Flash(end, color=ACCENT, line_length=0.4, num_lines=14))
        eq1b = jp("人 ＋ ロボ ＝ 1", 40, ACCENT).next_to(eq1, DOWN, buff=0.45)
        self.play(Write(eq1b), FadeOut(dashed))
        self.wait(0.6)
        self.play(FadeOut(VGroup(h1, eq1, eq1b)))

        # ---- 2. 腕が回って翼になる（角度 θ） ----
        h2 = jp("② 腕 → 翼", 32, ACCENT).move_to(h1)
        angle_txt = always_redraw(lambda: jp(f"θ = {theta.get_value():5.1f}°", 36).next_to(h2, DOWN, buff=0.4))
        angle_arc = always_redraw(lambda: Arc(
            radius=0.75, start_angle=-PI / 2, angle=theta.get_value() * DEGREES,
            arc_center=sh_r, color=ACCENT, stroke_width=5))
        self.play(FadeIn(h2, shift=LEFT * 0.3), FadeIn(angle_txt))
        self.add(angle_arc)
        self.play(theta.animate.set_value(135), run_time=2.5, rate_func=smooth)
        self.wait(0.4)

        # ---- 3. 体を倒して水平に（角度 φ） ----
        robot = VGroup(torso, head, eye, gem, leg_l, leg_r, arm_l, arm_r)
        arm_l.clear_updaters(); arm_r.clear_updaters()
        self.remove(angle_arc)
        h3 = jp("③ 姿勢を水平に", 32, ACCENT).move_to(h2)
        phi = ValueTracker(0)
        phi_txt = always_redraw(lambda: jp(f"φ = {phi.get_value():4.0f}°", 36).next_to(h3, DOWN, buff=0.4))
        self.play(FadeOut(h2), FadeOut(angle_txt), FadeIn(h3, shift=LEFT * 0.3))
        self.add(phi_txt)
        pivot = c.copy()
        last = [0.0]

        def tilt(m):
            d = phi.get_value() - last[0]
            m.rotate(-d * DEGREES, about_point=pivot)
            last[0] = phi.get_value()
        self.add(robot)  # シーンに登録しないと updater が動かない
        robot.add_updater(tilt)
        self.play(phi.animate.set_value(90), run_time=1.8)
        robot.remove_updater(tilt)
        self.wait(0.3)

        # ---- 4. 鳥型（バード）に変形 ----
        h4 = jp("④ バード形態", 32, ACCENT).move_to(h3)
        bc = c
        bird_body = Ellipse(width=2.6, height=0.7, color=ROBO, fill_opacity=0.3).move_to(bc)
        beak = Polygon(bc + [1.3, 0.22, 0], bc + [2.0, 0, 0], bc + [1.3, -0.22, 0], color=ACCENT, fill_opacity=0.7)
        wing_up = Polygon(bc + [-0.4, 0.3, 0], bc + [0.5, 0.3, 0], bc + [-0.9, 1.9, 0], color=ROBO, fill_opacity=0.3)
        wing_dn = Polygon(bc + [-0.4, -0.3, 0], bc + [0.5, -0.3, 0], bc + [-0.9, -1.9, 0], color=ROBO, fill_opacity=0.3)
        tail_a = Polygon(bc + [-1.25, 0.1, 0], bc + [-2.1, 0.5, 0], bc + [-1.9, 0.05, 0], color=ROBO, fill_opacity=0.3)
        tail_b = Polygon(bc + [-1.25, -0.1, 0], bc + [-2.1, -0.5, 0], bc + [-1.9, -0.05, 0], color=ROBO, fill_opacity=0.3)
        b_eye = Line(bc + [0.9, 0.12, 0], bc + [1.15, 0.12, 0], color=ACCENT, stroke_width=6)
        b_gem = Circle(0.14, color=GEM, fill_opacity=0.9).move_to(bc + [0.2, 0, 0])
        # 部品ごとに対応させて変形させる
        bird = VGroup(bird_body, beak, b_eye, b_gem, tail_a, tail_b, wing_up, wing_dn)
        self.play(FadeOut(h3), FadeOut(phi_txt), FadeIn(h4, shift=LEFT * 0.3))
        self.play(Transform(robot, bird), run_time=1.8, rate_func=smooth)
        self.wait(0.4)

        # ---- 5. 突撃（速度グラフ） ----
        h5 = jp("⑤ 突撃", 32, ACCENT).move_to(h4)
        eq5 = jp("v = v₀ + a t", 34).next_to(h5, DOWN, buff=0.35)
        self.play(FadeOut(h4), FadeIn(h5, shift=LEFT * 0.3), Write(eq5))
        axes = Axes(x_range=[0, 3, 1], y_range=[0, 10, 2], x_length=3.6, y_length=2.4,
                    tips=False, axis_config={"color": GREY_B}).next_to(eq5, DOWN, buff=0.5)
        xl = jp("t", 24, GREY_B).next_to(axes.x_axis, RIGHT, buff=0.15)
        yl = jp("v", 24, GREY_B).next_to(axes.y_axis, UP, buff=0.15)
        self.play(Create(axes), FadeIn(xl), FadeIn(yl), run_time=0.8)
        graph = axes.plot(lambda t: 1 + 3 * t, x_range=[0, 3], color=ACCENT)
        self.play(Create(graph),
                  robot.animate.shift(RIGHT * 2.2),
                  run_time=1.6, rate_func=rate_functions.ease_in_quad)
        self.play(robot.animate.shift(RIGHT * 12), run_time=0.7, rate_func=rate_functions.ease_in_cubic)
        self.wait(0.5)

        end_txt = jp("かっこいい瞬間 ＝ 角度 ＋ 軌道 ＋ 加速", 34, ACCENT).move_to(DOWN * 3.1)
        self.play(Write(end_txt), run_time=1.2)
        self.wait(1.5)
