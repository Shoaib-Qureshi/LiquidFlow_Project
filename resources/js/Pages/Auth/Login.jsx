import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 text-gray-900 transition-colors duration-300 dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-black dark:text-gray-100">
            <Head title="Log in" />

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse dark:bg-purple-800/60 dark:opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700 dark:bg-blue-800/60 dark:opacity-30"></div>
                <div className="absolute top-40 left-40 w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 dark:bg-rose-800/60 dark:opacity-30"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:shadow-3xl dark:bg-slate-900/80 dark:border-slate-700/60 dark:shadow-2xl dark:hover:shadow-3xl">
                    {/* Header */}
                    <div className="text-center ">

                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg"
                            style={{ width: '14em', padding: '20px', borderRadius: '12px' }}
                        >


                            <svg xmlns="http://www.w3.org/2000/svg" width="763" height="129" viewBox="0 0 763 129" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M174.302 9.80957H186.509V88.3881H227.833V99.8318H174.302V9.80957Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M243.474 39.5627H254.915V99.8317H243.474V39.5627ZM240.803 17.947C240.803 15.6586 241.628 13.6876 243.281 12.0348C244.934 10.3817 246.904 9.55518 249.193 9.55518C251.484 9.55518 253.455 10.3817 255.108 12.0348C256.761 13.6876 257.586 15.6586 257.586 17.947C257.586 20.2358 256.761 22.2068 255.108 23.8596C253.455 25.5127 251.484 26.3389 249.193 26.3389C246.904 26.3389 244.934 25.5127 243.281 23.8596C241.628 22.2068 240.803 20.2358 240.803 17.947Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M333.494 128.822H322.05V91.1857H321.794C319.762 94.3221 316.838 96.8014 313.021 98.624C309.208 100.446 305.139 101.358 300.815 101.358C296.156 101.358 291.938 100.552 288.166 98.9419C284.394 97.3312 281.171 95.1059 278.503 92.2663C275.832 89.4267 273.775 86.0783 272.336 82.2217C270.893 78.3647 270.172 74.1898 270.172 69.6974C270.172 65.2896 270.893 61.1571 272.336 57.3001C273.775 53.4434 275.832 50.0737 278.503 47.1917C281.171 44.3096 284.394 42.0632 288.166 40.4529C291.938 38.8423 296.156 38.0371 300.815 38.0371C304.884 38.0371 308.849 38.9272 312.704 40.7073C316.562 42.4874 319.593 44.9878 321.794 48.2091H322.05V39.5629H333.494V128.822ZM302.216 48.7174C299.162 48.7174 296.408 49.2475 293.95 50.307C291.493 51.3665 289.415 52.8074 287.721 54.63C286.023 56.4525 284.712 58.6564 283.78 61.2417C282.844 63.8273 282.379 66.6455 282.379 69.6974C282.379 72.7489 282.844 75.5675 283.78 78.1528C284.712 80.738 286.023 82.9419 287.721 84.7645C289.415 86.587 291.493 88.0279 293.95 89.0878C296.408 90.1473 299.162 90.677 302.216 90.677C305.267 90.677 308.021 90.1473 310.478 89.0878C312.939 88.0279 315.016 86.587 316.711 84.7645C318.405 82.9419 319.72 80.738 320.652 78.1528C321.584 75.5675 322.05 72.7489 322.05 69.6974C322.05 66.6455 321.584 63.8273 320.652 61.2417C319.72 58.6564 318.405 56.4525 316.711 54.63C315.016 52.8074 312.939 51.3665 310.478 50.307C308.021 49.2475 305.267 48.7174 302.216 48.7174Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M404.187 99.8315H392.747V90.5496H392.491C391.049 93.7706 388.55 96.3773 384.989 98.3693C381.431 100.361 377.317 101.357 372.654 101.357C369.69 101.357 366.891 100.912 364.264 100.022C361.638 99.132 359.326 97.7546 357.335 95.8896C355.343 94.025 353.752 91.6302 352.565 88.7057C351.381 85.7815 350.788 82.3272 350.788 78.3432V39.5625H362.228V75.1644C362.228 77.9615 362.611 80.3563 363.374 82.3483C364.137 84.3403 365.155 85.951 366.425 87.1799C367.698 88.4092 369.158 89.2993 370.811 89.8501C372.464 90.4012 374.183 90.6766 375.96 90.6766C378.335 90.6766 380.54 90.2953 382.573 89.5322C384.609 88.7695 386.386 87.5616 387.915 85.9085C389.441 84.2554 390.628 82.1575 391.473 79.6146C392.322 77.0715 392.747 74.0624 392.747 70.5871V39.5625H404.187V99.8315Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M422.371 39.5627H433.815V99.8317H422.371V39.5627ZM419.7 17.947C419.7 15.6586 420.528 13.6876 422.182 12.0348C423.835 10.3817 425.805 9.55518 428.093 9.55518C430.381 9.55518 432.352 10.3817 434.005 12.0348C435.658 13.6876 436.487 15.6586 436.487 17.947C436.487 20.2358 435.658 22.2068 434.005 23.8596C432.352 25.5127 430.381 26.3389 428.093 26.3389C425.805 26.3389 423.835 25.5127 422.182 23.8596C420.528 22.2068 419.7 20.2358 419.7 17.947Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M512.395 99.8318H500.951V91.1856H500.696C498.49 94.4066 495.46 96.9073 491.605 98.6874C487.747 100.468 483.785 101.358 479.716 101.358C475.054 101.358 470.836 100.552 467.064 98.9417C463.292 97.3311 460.072 95.0847 457.401 92.2027C454.73 89.3206 452.676 85.9723 451.234 82.1577C449.794 78.3435 449.073 74.1897 449.073 69.6973C449.073 65.2046 449.794 61.0297 451.234 57.173C452.676 53.316 454.73 49.9677 457.401 47.128C460.072 44.2884 463.292 42.0631 467.064 40.4528C470.836 38.8422 475.054 38.037 479.716 38.037C484.04 38.037 488.109 38.9481 491.923 40.7707C495.736 42.5932 498.663 45.0725 500.696 48.209H500.951V3.70654H512.395V99.8318ZM481.114 90.6769C484.168 90.6769 486.922 90.1472 489.379 89.0877C491.837 88.0278 493.914 86.5869 495.609 84.7644C497.307 82.9418 498.618 80.7379 499.55 78.1526C500.485 75.5674 500.951 72.7488 500.951 69.6973C500.951 66.6454 500.485 63.8272 499.55 61.2416C498.618 58.6563 497.307 56.4524 495.609 54.6298C493.914 52.8073 491.837 51.3664 489.379 50.3069C486.922 49.2474 484.168 48.7173 481.114 48.7173C478.063 48.7173 475.309 49.2474 472.852 50.3069C470.391 51.3664 468.313 52.8073 466.619 54.6298C464.924 56.4524 463.61 58.6563 462.678 61.2416C461.746 63.8272 461.28 66.6454 461.28 69.6973C461.28 72.7488 461.746 75.5674 462.678 78.1526C463.61 80.7379 464.924 82.9418 466.619 84.7644C468.313 86.5869 470.391 88.0278 472.852 89.0877C475.309 90.1472 478.063 90.6769 481.114 90.6769Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M565.16 47.9545H551.048L543.801 99.8317H535.408L542.655 47.9545H530.069L531.211 40.3253H543.801L546.089 24.0503C547.19 16.1669 549.796 10.5511 553.91 7.2028C558.02 3.85448 563.086 2.18066 569.102 2.18066C570.289 2.18066 571.476 2.26521 572.663 2.43467C573.85 2.60446 575.038 2.81637 576.225 3.07072L573.681 10.6995C572.663 10.4452 571.624 10.2333 570.565 10.0638C569.505 9.89436 568.425 9.80946 567.324 9.80946C565.033 9.80946 563.107 10.1908 561.537 10.9539C559.97 11.7166 558.717 12.7975 557.785 14.1962C556.853 15.5946 556.111 17.2267 555.563 19.0914C555.01 20.9564 554.607 22.9484 554.355 25.0674L552.191 40.3253H566.306L565.16 47.9545Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M582.962 99.8318H574.572L588.049 3.70654H596.442L582.962 99.8318Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M655.819 70.0787C656.326 66.7729 656.243 63.6789 655.563 60.7968C654.887 57.9148 653.72 55.414 652.067 53.295C650.414 51.1757 648.295 49.5015 645.71 48.2726C643.125 47.0433 640.095 46.4289 636.62 46.4289C633.145 46.4289 629.942 47.0433 627.019 48.2726C624.096 49.5015 621.531 51.1757 619.326 53.295C617.124 55.414 615.299 57.9148 613.859 60.7968C612.417 63.6789 611.444 66.7729 610.936 70.0787C610.425 73.3846 610.491 76.4786 611.126 79.3606C611.761 82.2427 612.907 84.7434 614.56 86.8624C616.213 88.9818 618.332 90.6559 620.917 91.8849C623.502 93.1139 626.532 93.7285 630.007 93.7285C633.483 93.7285 636.682 93.1139 639.609 91.8849C642.532 90.6559 645.117 88.9818 647.363 86.8624C649.61 84.7434 651.453 82.2427 652.896 79.3606C654.335 76.4786 655.311 73.3846 655.819 70.0787ZM664.975 70.0787C664.295 74.5715 662.918 78.7249 660.84 82.5395C658.766 86.3537 656.136 89.66 652.958 92.4571C649.779 95.2543 646.135 97.4371 642.024 99.0054C637.911 100.574 633.524 101.358 628.862 101.358C624.285 101.358 620.175 100.574 616.531 99.0054C612.883 97.4371 609.853 95.2543 607.437 92.4571C605.021 89.66 603.306 86.3537 602.288 82.5395C601.273 78.7249 601.1 74.5715 601.78 70.0787C602.374 65.586 603.73 61.4325 605.849 57.618C607.968 53.8034 610.615 50.4975 613.797 47.7003C616.976 44.9032 620.6 42.7203 624.668 41.1521C628.734 39.5839 633.058 38.7998 637.635 38.7998C642.297 38.7998 646.452 39.5839 650.097 41.1521C653.741 42.7203 656.771 44.9032 659.187 47.7003C661.603 50.4975 663.321 53.8034 664.336 57.618C665.354 61.4325 665.568 65.586 664.975 70.0787Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M684.553 40.3252L691.421 88.6422H691.676L714.433 40.3252H723.082L732.106 88.6422H732.362L752.962 40.3252H762.88L735.668 99.8315H726.26L717.36 51.0058H717.104L694.472 99.8315H685.064L674.638 40.3252H684.553Z" fill="#C7C5B7" /><path fill-rule="evenodd" clip-rule="evenodd" d="M5.36419 77.6222C2.5186 77.6222 0.209473 75.3134 0.209473 72.4685C0.209473 69.6235 2.5186 67.3128 5.36419 67.3128H51.1074C52.9228 67.3128 54.6644 66.5915 55.9492 65.3088C57.232 64.0243 57.9532 62.2826 57.9532 60.4676V52.4515C57.9532 47.9015 59.7608 43.5386 62.9777 40.3214C66.1945 37.1042 70.5581 35.2969 75.1083 35.2969H122.467C125.312 35.2969 127.622 37.6056 127.622 40.4506C127.622 43.2956 125.312 45.6062 122.467 45.6062H75.1083C73.2929 45.6062 71.5514 46.3276 70.2666 47.6103C68.9837 48.8949 68.2626 50.6365 68.2626 52.4515V60.4676C68.2626 65.0176 66.4549 69.3805 63.2381 72.5977C60.0213 75.815 55.6576 77.6222 51.1074 77.6222H5.36419Z" fill="url(#paint0_linear_238_57)" /><path fill-rule="evenodd" clip-rule="evenodd" d="M106.662 0C112.274 0 117.654 2.22915 121.62 6.19502C125.587 10.1643 127.819 15.5465 127.819 21.1547V107.76C127.819 110.609 125.509 112.916 122.663 112.916H5.15228C2.30585 112.916 0 110.609 0 107.76V21.1547C0 15.5465 2.22849 10.1643 6.19496 6.19502C10.1614 2.22915 15.5414 0 21.1532 0H106.662ZM106.662 10.3093H21.1532C18.2759 10.3093 15.5183 11.4524 13.4829 13.486C11.4514 15.5195 10.3083 18.2781 10.3083 21.1547V102.607H117.507V21.1547C117.507 18.2781 116.368 15.5195 114.332 13.486C112.297 11.4524 109.539 10.3093 106.662 10.3093Z" fill="url(#paint1_linear_238_57)" /><defs><linearGradient id="paint0_linear_238_57" x1="10.3148" y1="56.4595" x2="762.861" y2="56.4595" gradientUnits="userSpaceOnUse"><stop stop-color="#C7C5B7" /><stop offset="0.44" stop-color="#C7C5B7" /><stop offset="1" stop-color="#C7C5B7" /></linearGradient><linearGradient id="paint1_linear_238_57" x1="10.3082" y1="56.4596" x2="762.855" y2="56.4596" gradientUnits="userSpaceOnUse"><stop stop-color="#C7C5B7" /><stop offset="0.44" stop-color="#C7C5B7" /><stop offset="1" stop-color="#C7C5B7" /></linearGradient></defs></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Welcome back</h1>
                        <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
                    </div>

                    {/* Status message */}
                    {status && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-800 animate-fade-in dark:bg-green-900/40 dark:border-green-700 dark:text-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email field */}
                        <div className="space-y-2">
                            <div className="relative">
                                <InputLabel
                                    htmlFor="email"
                                    value="Email"
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                />
                                <div className="relative">
                                    <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`w-full pl-11 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100 ${errors.email ? 'border-red-300 bg-red-50/50 dark:border-red-500 dark:bg-red-500/10' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-900/60'
                                            }`}
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2 text-sm text-red-600 animate-fade-in dark:text-red-400" />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <div className="relative">
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                                />
                                <div className="relative">
                                    <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className={`w-full pl-11 pr-12 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-gray-100 ${errors.password ? 'border-red-300 bg-red-50/50 dark:border-red-500 dark:bg-red-500/10' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-900/60'
                                            }`}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField('')}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2 text-sm text-red-600 animate-fade-in dark:text-red-400" />
                            </div>
                        </div>

                        {/* Remember me checkbox */}
                        <div className="flex items-center">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                            </label>
                        </div>

                        {/* Submit button and forgot password */}
                        <div className="space-y-4">
                            <PrimaryButton
                                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Log in
                                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </>
                                )}
                            </PrimaryButton>

                            {canResetPassword && (
                                <div className="text-center">
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .shadow-3xl {
                    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
}
