skill_is_target_single(X) :- skill_target_type(X, 'Single').
skill_is_target_all(X) :- skill_target_type(X, 'All').
skill_is_target_self(X) :- skill_target_type(X, 'Self').
skill_is_target_ally_front(X) :- skill_target_type(X, 'AllyFront').
skill_is_target_ally_all(X) :- skill_target_type(X, 'AllyAll').
skill_is_target_ally_sub(X) :- skill_target_type(X, 'AllySub').
skill_is_target_ally_single(X) :- skill_target_type(X, 'AllySingle').
skill_is_target_ally_all_without_self(X) :- skill_target_type(X, 'AllyAllWithoutSelf').
skill_is_target_ally_single_without_self(X) :- skill_target_type(X, 'AllySingleWithoutSelf').
generalize(Skill) :- has_skill(Style, Skill), generalize(Style).
style_can_use_skill(Style, Skill) :-
  has_skill(Style2, Skill),
  chara_style(Chara, Style2),
  chara_style(Chara, Style),
  once((Style == Style2; skill_not_ex(Skill); generalize(Skill))).

sub_skill(Skill, SubSkill) :-
  skill_part(Skill, _, Part), rec_has_skill(Part, Skill).

rec_has_skill(Parent, Skill) :-
  has_skill(Parent, Skill);
  has_skill(Parent, SkillM), skill_part(SkillM, _, Part), rec_has_skill(Part, Skill).

is_aoe(X) :- skill_is_target_all(X).
skill_not_ex(X) :- \+(skill_is_ex(X)).
skill_not_advanced(X) :- \+(skill_is_advanced(X)).
skill_infinite_use(X) :- skill_use_count(X, 999).

listsum([], 0).
listsum([Head|Tail], Result) :-
  listsum(Tail, SumOfTail),
  Result is Head + SumOfTail.

style_passive_healsp_dungeon1t(Style, LimitBreak, HealSpSum) :-
  is_style(Style),
  between(0, 4, LimitBreak),
  findall(HealSp, (style_passive(Style, LB, Passive), LB =< LimitBreak, passive_healsp_amount(Passive, HealSp)), HealSps),
  listsum(HealSps, HealSpSum).

element(Part, 'NoElement') :- 
  is_part(Part),
  \+(element, 'Fire'),
  \+(element, 'Ice'),
  \+(element, 'Thunder'),
  \+(element, 'Light'),
  \+(element, 'Dark').

skill_attack_power(Skill, Power) :-
  is_skill(Skill),
  once((
    skill_part(Skill, 'AttackSkill', Part);
    skill_part(Skill, 'TokenAttack', Part);
    skill_part(Skill, 'PenetrationCriticalAttack', Part);
    skill_part(Skill, 'DamageRateChangeAttackSkill', Part);
    skill_part(Skill, 'AttackByOwnDpRate', Part);
    skill_part(Skill, 'AttackBySp', Part);
    skill_part(Skill, 'FixedHpDamageRateAttack', Part)
  )),
  power(Part, _, Power).
